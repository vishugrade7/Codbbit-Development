'use server';

import { firestore } from '@/firebase/server-init';
import type { UserProfile, SfdcAuth, Question } from '@/lib/types';
import { Octokit } from 'octokit';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extracts the SObject name and type (Class or Trigger) from Apex code.
 */
const getSObjectName = (code: string): { name: string | undefined, type: 'ApexClass' | 'ApexTrigger' | undefined } => {
    if (!code) return { name: undefined, type: undefined };
    
    const classMatch = code.match(/(?:@isTest\s+)?(?:public|private|global)?\s*(?:virtual|abstract|with sharing|without sharing|inherited sharing)?\s*(?:class|interface)\s+([a-zA-Z0-9_]+)/i);
    if (classMatch && classMatch[1]) return { name: classMatch[1], type: 'ApexClass' };
    
    const triggerMatch = code.match(/trigger\s+([a-zA-Z0-9_]+)\s+on/i);
    if (triggerMatch && triggerMatch[1]) return { name: triggerMatch[1], type: 'ApexTrigger' };
    
    return { name: undefined, type: undefined };
}

export async function initiateSalesforceOAuth(userId: string, challenge: string) {
  const consumerKey = process.env.SALESFORCE_CONSUMER_KEY;
  const callbackUrl = process.env.NEXT_PUBLIC_SALESFORCE_CALLBACK_URL;
  if (!consumerKey || !callbackUrl) return { success: false, error: "Salesforce environment variables missing." };
  
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
    const response = await fetch(`${auth.instanceUrl}${path}`, {
        ...options,
        headers: { 
            'Authorization': `Bearer ${auth.accessToken}`, 
            'Content-Type': 'application/json', 
            ...options.headers 
        },
    });
    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ message: 'API Error' }));
        const errorMessage = Array.isArray(errorBody) ? errorBody[0]?.message : (errorBody.message || errorBody.errorCode);
        throw new Error(errorMessage || 'Unknown Salesforce error');
    }
    return response.status === 204 ? null : response.json();
}

async function findMetadataRecord(auth: SfdcAuth, type: 'ApexClass' | 'ApexTrigger', name: string) {
    const query = `SELECT Id FROM ${type} WHERE Name = '${name}'`;
    const res = await sfdcFetch(auth, `/services/data/v60.0/tooling/query/?q=${encodeURIComponent(query)}`);
    return res.records?.[0] || null;
}

async function deleteMetadataRecord(auth: SfdcAuth, type: 'ApexClass' | 'ApexTrigger', id: string) {
    try { 
        await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/${type}/${id}`, { method: 'DELETE' }); 
    } catch (e) {
        console.warn(`Failed to delete existing ${type} ${id}:`, e);
    }
}

/**
 * Resiliently upserts Apex metadata, handling cross-type collisions and eventual consistency lag.
 */
async function nuclearUpsertMetadata(auth: SfdcAuth, type: 'ApexClass' | 'ApexTrigger', name: string, body: string, objectName?: string): Promise<string> {
    const otherType = type === 'ApexClass' ? 'ApexTrigger' : 'ApexClass';
    const collision = await findMetadataRecord(auth, otherType, name);
    if (collision) { 
        await deleteMetadataRecord(auth, otherType, collision.Id); 
        await sleep(1500);
    }

    let existing = await findMetadataRecord(auth, type, name);
    
    try {
        if (existing) {
            await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/${type}/${existing.Id}`, {
                method: 'PATCH',
                body: JSON.stringify(type === 'ApexClass' ? { Body: body } : { Body: body, TableEnumOrId: objectName }),
            });
            return existing.Id;
        } else {
            const res = await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/${type}/`, {
                method: 'POST',
                body: JSON.stringify(type === 'ApexClass' ? { Body: body, Name: name } : { Body: body, Name: name, TableEnumOrId: objectName }),
            });
            return res.id;
        }
    } catch (error: any) {
        const msg = error.message || '';
        // Handle duplicate value error by extracting ID and forcing update
        if (msg.toLowerCase().includes('duplicate value found') || msg.includes('DUPLICATE_VALUE')) {
            const idMatch = msg.match(/01[pq][a-zA-Z0-9]{12,15}/);
            let recoveredId = idMatch ? idMatch[0] : null;
            
            if (!recoveredId) {
                await sleep(2000);
                const secondTry = await findMetadataRecord(auth, type, name);
                recoveredId = secondTry?.Id;
            }

            if (recoveredId) {
                await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/${type}/${recoveredId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(type === 'ApexClass' ? { Body: body } : { Body: body, TableEnumOrId: objectName }),
                });
                return recoveredId;
            }
        }
        throw error;
    }
}

export async function executeSalesforceCode(auth: SfdcAuth, code: string, type: 'anonymous' | 'test class', testCode?: string, userId?: string, problem?: Partial<Question>) {
    try {
        if (type === 'anonymous') {
            const res = await sfdcFetch(auth, `/services/data/v60.0/tooling/executeAnonymous/?anonymousBody=${encodeURIComponent(code)}`);
            return { success: res.compiled && res.success, logs: res.debugLog || "Executed", error: res.compileProblem || res.exceptionMessage || "" };
        }
        if (type === 'test class' && testCode && problem) {
            const { name: solName, type: solType } = getSObjectName(code);
            const { name: testName } = getSObjectName(testCode);
            if (!solName || !testName) throw new Error("Could not parse Apex names.");
            
            await nuclearUpsertMetadata(auth, solType!, solName, code, problem.object);
            await nuclearUpsertMetadata(auth, 'ApexClass', testName, testCode);

            const runRes = await sfdcFetch(auth, `/services/data/v60.0/tooling/runTestsAsynchronous/`, {
                method: "POST",
                body: JSON.stringify({ classNames: testName }),
            });
            const asyncJobId = typeof runRes === 'string' ? runRes : runRes.id;
            
            let status = "Queued";
            for (let i = 0; i < 45; i++) {
                await sleep(2000);
                const job = await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/AsyncApexJob/${asyncJobId}`);
                status = job.Status;
                if (["Completed", "Failed", "Aborted"].includes(status)) break;
            }
            if (status !== "Completed") throw new Error(`Test run timed out. Status: ${status}`);

            const resultQuery = `SELECT Outcome, MethodName, Message, ApexLogId, RunTime FROM ApexTestResult WHERE AsyncApexJobId = '${asyncJobId}'`;
            const resultData = await sfdcFetch(auth, `/services/data/v60.0/tooling/query?q=${encodeURIComponent(resultQuery)}`);
            const failedTest = resultData.records.find((r: any) => r.Outcome !== "Pass");
            const logId = resultData.records[0]?.ApexLogId;
            const logs = logId ? (await (await fetch(`${auth.instanceUrl}/services/data/v60.0/tooling/sobjects/ApexLog/${logId}/Body`, { headers: { 'Authorization': `Bearer ${auth.accessToken}` } })).text()) : "";

            if (failedTest) return { success: false, logs, error: `❌ ${failedTest.MethodName}: ${failedTest.Message}` };
            return { success: true, logs, runtime: resultData.records.reduce((acc: number, r: any) => acc + (r.RunTime || 0), 0) };
        }
    } catch (e: any) { 
        return { success: false, logs: "", error: e.message || "An unknown Salesforce API error occurred." }; 
    }
    return { success: false, logs: "", error: "Invalid execution request" };
}

export async function initiateGitHubOAuth(userId: string) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) return { success: false, error: "GitHub Client ID not configured on server." };
    const url = new URL('https://github.com/login/oauth/authorize');
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`);
    url.searchParams.append('scope', 'repo user');
    url.searchParams.append('state', userId);
    return { success: true, url: url.toString() };
}

export async function syncSolutionToGithub(userId: string, data: { title: string, category: string, code: string }) {
    try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        const profile = userDoc.data() as UserProfile;
        if (!profile?.githubAuth?.accessToken) throw new Error("GitHub account not connected.");
        
        const octokit = new Octokit({ auth: profile.githubAuth.accessToken });
        const repo = 'Codbbit-Solutions';
        const owner = profile.githubAuth.username;
        
        try { 
            await octokit.rest.repos.get({ owner, repo }); 
        } catch (e) { 
            await octokit.rest.repos.createForAuthenticatedUser({ 
                name: repo, 
                description: 'Apex coding solutions from Codbbit.com', 
                private: true 
            }); 
        }
        
        const path = `${data.category.replace(/\s+/g, '-')}/${data.title.replace(/\s+/g, '-')}.cls`;
        const content = Buffer.from(data.code).toString('base64');
        let sha: string | undefined;
        
        try { 
            const { data: file } = await octokit.rest.repos.getContent({ owner, repo, path }); 
            if (!Array.isArray(file)) sha = file.sha; 
        } catch (e) {}
        
        await octokit.rest.repos.createOrUpdateFileContents({ 
            owner, 
            repo, 
            path, 
            message: `Save solution for ${data.title}`, 
            content, 
            sha 
        });
        return { success: true };
    } catch (e: any) { 
        return { success: false, error: e.message || "Failed to sync solution to GitHub." }; 
    }
}

export async function getLwcBundles(userId: string, authOverride?: SfdcAuth) {
    try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        const auth = authOverride || userDoc.data()?.sfdcAuth;
        if (!auth) throw new Error('Salesforce not connected.');
        const query = "SELECT Id, DeveloperName, LastModifiedDate FROM LightningComponentBundle ORDER BY LastModifiedDate DESC";
        const result = await sfdcFetch(auth, `/services/data/v60.0/tooling/query?q=${encodeURIComponent(query)}`);
        return { success: true, data: result.records };
    } catch (e: any) { return { success: false, error: e.message }; }
}

export async function getLwcBundleFiles(bundleId: string, userId: string, authOverride?: SfdcAuth) {
    try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        const auth = authOverride || userDoc.data()?.sfdcAuth;
        if (!auth) throw new Error('Salesforce not connected.');
        const query = `SELECT Id, FilePath, Source FROM LightningComponentResource WHERE LightningComponentBundleId='${bundleId}'`;
        const result = await sfdcFetch(auth, `/services/data/v60.0/tooling/query?q=${encodeURIComponent(query)}`);
        return { success: true, data: result.records };
    } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deployLwc(userId: string, lwcData: any, authOverride?: SfdcAuth) {
    try {
        const userDoc = await firestore().collection('users').doc(userId).get();
        const auth = authOverride || userDoc.data()?.sfdcAuth;
        if (!auth) throw new Error('Salesforce not connected.');
        return { success: true };
    } catch (e: any) { return { success: false, error: e.message }; }
}

export async function deleteSalesforceMetadata(auth: SfdcAuth, solCode: string, testCode: string) {
    const { name: solName, type: solType } = getSObjectName(solCode);
    const { name: testName } = getSObjectName(testCode);
    if (solName) { const rec = await findMetadataRecord(auth, solType!, solName); if (rec) await deleteMetadataRecord(auth, solType!, rec.Id); }
    if (testName) { const rec = await findMetadataRecord(auth, 'ApexClass', testName); if (rec) await deleteMetadataRecord(auth, 'ApexClass', rec.Id); }
    return { success: true };
}

export async function initiateLinkedInOAuth(userId: string) {
  const oauthUrl = new URL('https://www.linkedin.com/oauth/v2/authorization');
  oauthUrl.searchParams.append('response_type', 'code');
  oauthUrl.searchParams.append('client_id', process.env.LINKEDIN_CLIENT_ID!);
  oauthUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_BASE_URL}/api/linkedin/callback`);
  oauthUrl.searchParams.append('state', userId);
  oauthUrl.searchParams.append('scope', 'profile openid');
  return { success: true, url: oauthUrl.toString() };
}

export async function installSalesforcePackage(auth: SfdcAuth, key: string, userId: string) {
    return { success: true };
}
