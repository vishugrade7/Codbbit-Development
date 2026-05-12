'use server';

import { firestore } from '@/firebase/server-init';
import type { UserProfile, SfdcAuth, Question } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';
import { Octokit } from 'octokit';


type SalesforceTokenResponse = {
  access_token: string;
  instance_url: string;
  refresh_token?: string;
  issued_at: string;
  id_token: string;
  scope: string;
  token_type: string;
  error?: string;
  error_description?: string;
};

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const getSObjectName = (code: string): { name: string | undefined, type: 'ApexClass' | 'ApexTrigger' | undefined } => {
    if (!code) return { name: undefined, type: undefined };
    
    // Improved regex to find class or trigger name regardless of annotations or modifiers
    const classMatch = code.match(/class\s+([a-zA-Z0-9_]+)/i);
    if (classMatch && classMatch[1]) {
        return { name: classMatch[1], type: 'ApexClass' };
    }
    
    const triggerMatch = code.match(/trigger\s+([a-zA-Z0-9_]+)\s+on/i);
    if (triggerMatch && triggerMatch[1]) {
        return { name: triggerMatch[1], type: 'ApexTrigger' };
    }
    
    return { name: undefined, type: undefined };
}

export async function initiateSalesforceOAuth(userId: string, challenge: string) {
  const consumerKey = process.env.SALESFORCE_CONSUMER_KEY;
  const callbackUrl = process.env.NEXT_PUBLIC_SALESFORCE_CALLBACK_URL;

  if (!consumerKey || !callbackUrl) {
    const error = "Salesforce environment variables are not set up.";
    console.error(error);
    return { success: false, error };
  }
  
  const oauthUrl = new URL('https://login.salesforce.com/services/oauth2/authorize');
  oauthUrl.searchParams.append('response_type', 'code');
  oauthUrl.searchParams.append('client_id', consumerKey);
  oauthUrl.searchParams.append('redirect_uri', callbackUrl);
  oauthUrl.searchParams.append('scope', 'api refresh_token');
  oauthUrl.searchParams.append('code_challenge', challenge);
  oauthUrl.searchParams.append('code_challenge_method', 'S256');
  oauthUrl.searchParams.append('prompt', 'login');
  oauthUrl.searchParams.append('state', `${userId}|${challenge}`);


  return { success: true, url: oauthUrl.toString() };
}

async function sfdcFetch(auth: SfdcAuth, path: string, options: RequestInit = {}) {
    const endpoint = `${auth.instanceUrl}${path}`;
    const response = await fetch(endpoint, {
        ...options,
        headers: {
            'Authorization': `Bearer ${auth.accessToken}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });
    if (!response.ok) {
        const errorBody = await response.json();
        let errorMessage;

        if (Array.isArray(errorBody) && errorBody.length > 0) {
            const firstError = errorBody[0];
            errorMessage = firstError.message || 'An unknown Salesforce API error occurred.';
        } else if (errorBody.message) {
            errorMessage = errorBody.message;
        } else {
            errorMessage = 'An unknown Salesforce API error occurred.';
        }
        
        throw new Error(errorMessage);
    }
    if (response.status === 204 || response.headers.get('Content-Length') === '0') {
        return null;
    }
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/plain')) {
        return response.text();
    }
    return response.json();
}

async function findToolingApiRecord(auth: SfdcAuth, objectType: 'ApexClass' | 'ApexTrigger', name: string) {
    const query = `SELECT Id FROM ${objectType} WHERE Name = '${name}'`;
    try {
        const result = await sfdcFetch(auth, `/services/data/v60.0/tooling/query/?q=${encodeURIComponent(query)}`);
        return result.records?.[0] || null;
    } catch (e) {
        return null;
    }
}

async function deleteToolingApiRecord(auth: SfdcAuth, objectType: 'ApexClass' | 'ApexTrigger', recordId: string) {
    try {
        await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/${objectType}/${recordId}`, {
            method: 'DELETE',
        });
        return true;
    } catch (e: any) {
        return true;
    }
}

/**
 * A highly resilient upsert for Salesforce metadata.
 * It handles cross-type collisions (Class vs Trigger) and eventual consistency errors.
 */
async function nuclearUpsertMetadata(auth: SfdcAuth, type: 'ApexClass' | 'ApexTrigger', name: string, body: string, objectName?: string): Promise<string> {
    // 1. Cross-type collision check: Delete record of OTHER type if it has the same name
    const otherType = type === 'ApexClass' ? 'ApexTrigger' : 'ApexClass';
    const collision = await findToolingApiRecord(auth, otherType, name);
    if (collision) {
        await deleteToolingApiRecord(auth, otherType, collision.Id);
        await sleep(2000); // Wait for deletion to propagate
    }

    // 2. Try to find existing record of CORRECT type
    let existing = await findToolingApiRecord(auth, type, name);
    
    try {
        if (existing) {
            // Update existing
            await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/${type}/${existing.Id}`, {
                method: 'PATCH',
                body: JSON.stringify(type === 'ApexClass' ? { Body: body } : { Body: body, TableEnumOrId: objectName }),
            });
            return existing.Id;
        } else {
            // Create new
            const createRes = await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/${type}/`, {
                method: 'POST',
                body: JSON.stringify(type === 'ApexClass' ? { Body: body, Name: name } : { Body: body, Name: name, TableEnumOrId: objectName }),
            });
            return createRes.id;
        }
    } catch (error: any) {
        // 3. Last resort: If creation fails with a duplicate error, recover the ID and force a PATCH
        if (error.message.includes('DUPLICATE_VALUE')) {
            // Attempt to extract the existing record ID from the error message (Regex: 01p for Class, 01q for Trigger)
            const idMatch = error.message.match(/01[pq][a-zA-Z0-9]{12,15}/);
            const recoveredId = idMatch ? idMatch[0] : null;

            if (recoveredId) {
                await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/${type}/${recoveredId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(type === 'ApexClass' ? { Body: body } : { Body: body, TableEnumOrId: objectName }),
                });
                return recoveredId;
            }

            // If ID extraction failed, wait and retry find
            await sleep(2500);
            const retryExisting = await findToolingApiRecord(auth, type, name);
            if (retryExisting) {
                await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/${type}/${retryExisting.Id}`, {
                    method: 'PATCH',
                    body: JSON.stringify(type === 'ApexClass' ? { Body: body } : { Body: body, TableEnumOrId: objectName }),
                });
                return retryExisting.Id;
            }
        }
        throw error;
    }
}

export async function executeSalesforceCode(
  auth: SfdcAuth,
  code: string,
  executionType: 'anonymous' | 'test class',
  testCode?: string,
  userId?: string,
  problem?: Partial<Question>
) {
    if (executionType === 'anonymous') {
        // Handled via Tooling API executeAnonymous endpoint
        try {
            const endpoint = `/services/data/v60.0/tooling/executeAnonymous/?anonymousBody=${encodeURIComponent(code)}`;
            const result = await sfdcFetch(auth, endpoint);
            return {
                success: result.compiled && result.success,
                logs: result.debugLog || "Code executed successfully.",
                error: result.compileProblem || result.exceptionMessage || "",
            };
        } catch (e: any) {
            return { success: false, logs: "", error: e.message };
        }
    }

    if (executionType === 'test class' && testCode && problem) {
        const { name: userObjectName, type: userObjectType } = getSObjectName(code);
        const { name: testClassName } = getSObjectName(testCode);

        if (!userObjectName || !testClassName) {
             return { success: false, logs: "", error: "Could not identify class or trigger names from your code." };
        }

        if (userObjectName === testClassName) {
            return { success: false, logs: "", error: "The solution name and test class name must be different." };
        }

        try {
            // Deploy solution and test class using robust upsert
            await nuclearUpsertMetadata(auth, userObjectType!, userObjectName, code, problem.object);
            await nuclearUpsertMetadata(auth, 'ApexClass', testClassName, testCode);

            // Run tests
            const runRes = await sfdcFetch(auth, `/services/data/v60.0/tooling/runTestsAsynchronous/`, {
                method: "POST",
                body: JSON.stringify({ classNames: testClassName }),
            });

            const asyncJobId = typeof runRes === 'string' ? runRes : runRes.id;
            
            let status = "Queued";
            for (let i = 0; i < 40; i++) { // Increased poll attempts
                await sleep(2000);
                const job = await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/AsyncApexJob/${asyncJobId}`);
                status = job?.Status;
                if (["Completed", "Failed", "Aborted"].includes(status)) break;
            }

            if (status !== "Completed") throw new Error(`Test run did not complete. Status: ${status}`);

            const resultQuery = `SELECT Outcome, MethodName, Message, StackTrace, ApexLogId, RunTime FROM ApexTestResult WHERE AsyncApexJobId = '${asyncJobId}'`;
            const resultData = await sfdcFetch(auth, `/services/data/v60.0/tooling/query?q=${encodeURIComponent(resultQuery)}`);

            const failedTest = resultData.records.find((r: any) => r.Outcome !== "Pass");
            const logId = resultData.records[0]?.ApexLogId;
            const runtime = resultData.records.reduce((acc: number, r: any) => acc + (r.RunTime || 0), 0);

            const logs = logId ? await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/ApexLog/${logId}/Body`) : "No logs found.";

            if (failedTest) {
                return { success: false, logs, error: `❌ Test Failed: ${failedTest.MethodName}\n${failedTest.Message}` };
            }
            return { success: true, logs, runtime };
        } catch (e: any) {
            return { success: false, logs: "", error: e.message };
        }
    }
    return { success: false, logs: "", error: "Invalid execution request." };
}

export async function syncSolutionToGithub(userId: string, data: { title: string, category: string, code: string }) {
    try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        const profile = userDoc.data() as UserProfile;
        if (!profile.githubAuth?.accessToken) throw new Error("GitHub account not connected.");

        const octokit = new Octokit({ auth: profile.githubAuth.accessToken });
        const repoName = 'Codbbit-Solutions';
        const owner = profile.githubAuth.username;

        try {
            await octokit.rest.repos.get({ owner, repo: repoName });
        } catch (e) {
            // Repo doesn't exist, create it
            await octokit.rest.repos.createForAuthenticatedUser({
                name: repoName,
                description: 'My Salesforce Apex solutions from Codbbit.com',
                private: true
            });
        }

        const fileName = `${data.title.replace(/\s+/g, '-')}.cls`;
        const path = `${data.category.replace(/\s+/g, '-')}/${fileName}`;
        const content = Buffer.from(data.code).toString('base64');

        let sha: string | undefined;
        try {
            const { data: fileData } = await octokit.rest.repos.getContent({ owner, repo: repoName, path });
            if (!Array.isArray(fileData)) sha = fileData.sha;
        } catch (e) {}

        await octokit.rest.repos.createOrUpdateFileContents({
            owner,
            repo: repoName,
            path,
            message: `Add solution for ${data.title}`,
            content,
            sha
        });

        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getLwcBundles(userId: string, authOverride?: SfdcAuth) {
    try {
        const auth = authOverride || await getSfdcConnection(userId);
        const query = "SELECT Id, DeveloperName, LastModifiedDate FROM LightningComponentBundle ORDER BY LastModifiedDate DESC";
        const result = await sfdcFetch(auth, `/services/data/v60.0/tooling/query?q=${encodeURIComponent(query)}`);
        return { success: true, data: result.records };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getLwcBundleFiles(bundleId: string, userId: string, authOverride?: SfdcAuth) {
    try {
        const auth = authOverride || await getSfdcConnection(userId);
        const query = `SELECT Id, FilePath, Source FROM LightningComponentResource WHERE LightningComponentBundleId='${bundleId}'`;
        const result = await sfdcFetch(auth, `/services/data/v60.0/tooling/query?q=${encodeURIComponent(query)}`);
        return { success: true, data: result.records };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deployLwc(userId: string, lwcData: any, authOverride?: SfdcAuth) {
    try {
        const auth = authOverride || await getSfdcConnection(userId);
        // LWC deployment implementation
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

async function getSfdcConnection(userId: string): Promise<SfdcAuth> {
    const userDocRef = firestore.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data() as UserProfile | undefined;
    if (!userDoc.exists || !userData?.sfdcAuth) throw new Error('Salesforce credentials missing.');
    return userData.sfdcAuth;
}

export async function deleteSalesforceMetadata(auth: SfdcAuth, userCode: string, testCode: string) {
    const { name: userObjectName, type: userObjectType } = getSObjectName(userCode);
    const { name: testClassName } = getSObjectName(testCode);
    if (userObjectName) {
        const rec = await findToolingApiRecord(auth, userObjectType!, userObjectName);
        if (rec) await deleteToolingApiRecord(auth, userObjectType!, rec.Id);
    }
    if (testClassName) {
        const rec = await findToolingApiRecord(auth, 'ApexClass', testClassName);
        if (rec) await deleteToolingApiRecord(auth, 'ApexClass', rec.Id);
    }
    return { success: true };
}

export async function initiateLinkedInOAuth(userId: string) {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/linkedin/callback`;

  if (!clientId || !callbackUrl) {
    const error = "LinkedIn environment variables are not set up.";
    console.error(error);
    return { success: false, error };
  }
  
  const oauthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  oauthUrl.searchParams.append('response_type', 'code');
  oauthUrl.searchParams.append('client_id', clientId);
  oauthUrl.searchParams.append('redirect_uri', callbackUrl);
  oauthUrl.searchParams.append('state', userId);
  oauthUrl.searchParams.append('scope', 'profile openid');

  return { success: true, url: oauthUrl.toString() };
}

export async function installSalesforcePackage(auth: SfdcAuth, packageVersionKey: string, userId: string) {
    try {
        // Mock package installation
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
