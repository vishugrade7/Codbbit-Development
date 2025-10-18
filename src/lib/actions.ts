

'use server';

import { doc, getDoc, updateDoc, deleteDoc } from 'firebase-admin/firestore';
import { firestore } from '@/firebase/server-init';
import type { UserProfile, SfdcAuth, Question } from '@/lib/types';
import { getAuth } from 'firebase-admin/auth';
import { revalidatePath } from 'next/cache';


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

const getSObjectName = (code: string): { name: string | undefined, type: 'Class' | 'Trigger' | undefined } => {
    // Look for 'class MyClassName'
    const classMatch = code.match(/(?:public|global)\s+(?:virtual\s+|abstract\s+|with\s+sharing\s+|without\s+sharing\s+)*class\s+([a-zA-Z0-9_]+)/);
    if (classMatch && classMatch[1]) {
        return { name: classMatch[1], type: 'Class' };
    }

    // Look for '@isTest class MyTestClassName'
    const testClassMatch = code.match(/@isTest\s+(?:private|public|global)?\s+class\s+([a-zA-Z0-9_]+)/);
    if (testClassMatch && testClassMatch[1]) {
        return { name: testClassMatch[1], type: 'Class' };
    }
    
    // Look for 'trigger MyTriggerName on ObjectName'
    const triggerMatch = code.match(/trigger\s+([a-zA-Z0-9_]+)\s+on\s+([a-zA-Z0-9_]+)/);
    if (triggerMatch && triggerMatch[1]) {
        return { name: triggerMatch[1], type: 'Trigger' };
    }
    
    return { name: undefined, type: undefined };
}


function sanitizeApexCode(code: string): string {
  // Replace the constants first
  code = code
    .replace(/\bInteger\.MAX_VALUE\b/g, '2147483647')
    .replace(/\bInteger\.MIN_VALUE\b/g, '-2147483648')
    .replace(/\bDouble\.MAX_VALUE\b/g, '1.7976931348623157E+308')
    .replace(/\bDouble\.MIN_VALUE\b/g, '2.2250738585072014E-308');

  // Clamp integer literals (digits only) to Integer range
  code = code.replace(/\b\d+\b/g, (match) => {
    const num = Number(match);
    if (num > 2147483647) return '2147483647';
    if (num < -2147483648) return '-2147483648';
    return match;
  });

  // Optional: clamp double literals if necessary
  code = code.replace(/\b\d+\.\d+([eE][+-]?\d+)?\b/g, (match) => {
    const num = Number(match);
    if (num > 1.7976931348623157e308) return '1.7976931348623157E+308';
    if (num < -1.7976931348623157e308) return '-1.7976931348623157E+308';
    return match;
  });

  return code;
}


export async function initiateSalesforceOAuth(challenge: string) {
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

  return { success: true, url: oauthUrl.toString() };
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
  oauthUrl.searchParams.append('state', userId); // Pass user ID in state
  oauthUrl.searchParams.append('scope', 'profile openid');

  return { success: true, url: oauthUrl.toString() };
}


async function getSfdcConnection(userId: string): Promise<SfdcAuth> {
    const db = firestore;
    const userDocRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.data() as UserProfile | undefined;

    if (!userDoc.exists() || !userData?.sfdcAuth?.refreshToken) {
        throw new Error('Salesforce account not connected or refresh token missing.');
    }

    let auth = userData.sfdcAuth;

    // Refresh if token is older than 55 minutes, or if connection is marked as disconnected
    const tokenAgeMinutes = (Date.now() - (auth.issuedAt || 0)) / (1000 * 60);
    if (tokenAgeMinutes > 55 || !auth.connected) { 
        console.log("Salesforce token is old or connection is stale, attempting refresh...");
        const consumerKey = process.env.SALESFORCE_CONSUMER_KEY;
        const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;

        if(!consumerKey || !clientSecret) {
             throw new Error('Salesforce client credentials are not configured on the server.');
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'refresh_token');
        params.append('client_id', consumerKey);
        params.append('client_secret', clientSecret);
        params.append('refresh_token', auth.refreshToken);

        const response = await fetch(`https://login.salesforce.com/services/oauth2/token`, {
            method: 'POST',
            body: params,
        });

        const data: SalesforceTokenResponse = await response.json();

        if (!response.ok) {
            console.error("Failed to refresh Salesforce token, marking as disconnected.", data.error_description);
            await updateDoc(userDocRef, { "sfdcAuth.connected": false });
            throw new Error('Failed to refresh Salesforce token. Please reconnect.');
        }
        
        console.log("Salesforce token refreshed successfully.");
        const newAuth: Partial<SfdcAuth> = {
            connected: true, // Mark as connected on successful refresh
            accessToken: data.access_token,
            issuedAt: parseInt(data.issued_at, 10),
            ...(data.refresh_token && { refreshToken: data.refresh_token }),
        };

        await updateDoc(userDocRef, { sfdcAuth: { ...auth, ...newAuth } });
        auth = { ...auth, ...newAuth } as SfdcAuth;
    }
    
    return auth;
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
            if (firstError.lineNumber && firstError.columnNumber) {
                errorMessage += ` (Line: ${firstError.lineNumber}, Column: ${firstError.columnNumber})`;
            }
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
     // Handle plain text response for debug logs
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/plain')) {
        return response.text();
    }
    return response.json();
}

async function salesforceExecuteAnonymous(
  code: string,
  creds: SfdcAuth
): Promise<{ success: boolean; logs: string; error?: string }> {
  const { instanceUrl, accessToken } = creds;
  if (!instanceUrl || !accessToken) {
    return { success: false, logs: "", error: "Missing Salesforce credentials." };
  }

  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  try {
    // 1. Get Current User Id (more reliable)
    const userInfoRes = await fetch(`${instanceUrl}/services/oauth2/userinfo`, { headers });
    const userInfo = await userInfoRes.json();

    const username = userInfo.preferred_username;
    const userQuery = await fetch(
      `${instanceUrl}/services/data/v60.0/query?q=${encodeURIComponent(
        `SELECT Id FROM User WHERE Username = '${username}'`
      )}`,
      { headers }
    );
    const userData = await userQuery.json();
    const userId = userData.records?.[0]?.Id;
    if (!userId) throw new Error("Could not fetch user Id.");

    // 2. Ensure DebugLevel exists
    const debugQuery = `${instanceUrl}/services/data/v60.0/tooling/query/?q=${encodeURIComponent(
      "SELECT Id FROM DebugLevel WHERE DeveloperName='CodeDebugLevel'"
    )}`;
    const debugRes = await fetch(debugQuery, { headers });
    const debugData = await debugRes.json();

    let debugLevelId = debugData.records?.[0]?.Id;
    if (!debugLevelId) {
      const createDebug = await fetch(`${instanceUrl}/services/data/v60.0/tooling/sobjects/DebugLevel/`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          DeveloperName: "CodeDebugLevel",
          MasterLabel: "CodeDebugLevel",
          ApexCode: "FINEST",
          ApexProfiling: "INFO",
          Callout: "INFO",
          Database: "INFO",
          System: "DEBUG",
          Validation: "INFO",
          Visualforce: "INFO",
          Workflow: "INFO",
        }),
      });
      const debugResult = await createDebug.json();
      debugLevelId = debugResult.id;
    }

    // 3. Remove old TraceFlags for that user (avoid conflicts)
    const oldFlags = await fetch(
      `${instanceUrl}/services/data/v60.0/tooling/query?q=${encodeURIComponent(
        `SELECT Id FROM TraceFlag WHERE TracedEntityId = '${userId}'`
      )}`,
      { headers }
    );
    const oldFlagsData = await oldFlags.json();
    for (const flag of oldFlagsData.records || []) {
      await fetch(`${instanceUrl}/services/data/v60.0/tooling/sobjects/TraceFlag/${flag.Id}`, {
        method: "DELETE",
        headers,
      });
    }

    // 4. Create fresh TraceFlag
    const expiration = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const traceCreate = await fetch(`${instanceUrl}/services/data/v60.0/tooling/sobjects/TraceFlag/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        TracedEntityId: userId,
        LogType: "USER_DEBUG",
        DebugLevelId: debugLevelId,
        ExpirationDate: expiration,
      }),
    });
    const traceData = await traceCreate.json();
    if (!traceData.id) throw new Error("Failed to create TraceFlag.");

    // 5. Execute Anonymous Apex
    const execUrl = `${instanceUrl}/services/data/v60.0/tooling/executeAnonymous/?anonymousBody=${encodeURIComponent(
      code
    )}`;
    const execRes = await fetch(execUrl, { method: "GET", headers });
    const execResult = await execRes.json();

    if (!execResult.success) {
      const error =
        execResult.compileProblem ||
        execResult.exceptionMessage ||
        JSON.stringify(execResult, null, 2);
      return { success: false, logs: "", error };
    }

    // 6. Fetch the latest ApexLog (wait a bit for it to generate)
    await new Promise(res => setTimeout(res, 1500));
    const logQuery = await fetch(
      `${instanceUrl}/services/data/v60.0/tooling/query?q=${encodeURIComponent(
        `SELECT Id FROM ApexLog WHERE LogUserId='${userId}' ORDER BY StartTime DESC LIMIT 1`
      )}`,
      { headers }
    );
    const logData = await logQuery.json();
    const logId = logData.records?.[0]?.Id;

    if (!logId) {
      return {
        success: true,
        logs: "Executed successfully, but no debug log found. Try again in a few seconds.",
      };
    }

    const logBodyUrl = `${instanceUrl}/services/data/v60.0/tooling/sobjects/ApexLog/${logId}/Body`;
    const logText = await (await fetch(logBodyUrl, { headers })).text();

    // 7. Filter debug lines
    const debugLines = logText
      .split("\n")
      .filter(l => l.includes("|DEBUG|"))
      .map(l => l.split("|DEBUG|")[1])
      .join("\n");

    return {
      success: true,
      logs: debugLines || logText || "Executed successfully.",
    };
  } catch (err) {
    return {
      success: false,
      logs: "",
      error: err instanceof Error ? err.message : "Unknown error occurred",
    };
  }
}

async function findToolingApiRecord(auth: SfdcAuth, objectType: 'ApexClass' | 'ApexTrigger', name: string) {
    const query = `SELECT Id FROM ${objectType} WHERE Name = '${name}'`;
    try {
        const result = await sfdcFetch(auth, `/services/data/v60.0/tooling/query/?q=${encodeURIComponent(query)}`);
        return result.records?.[0] || null;
    } catch (e) {
        console.warn(`Could not query for ${objectType} with name ${name}. It might not exist. Error:`, e);
        return null;
    }
}

async function deleteToolingApiRecord(auth: SfdcAuth, objectType: 'ApexClass' | 'ApexTrigger', recordId: string) {
    try {
        await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/${objectType}/${recordId}`, {
            method: 'DELETE',
        });
        console.log(`Successfully deleted ${objectType} with ID ${recordId}`);
        return true;
    } catch (e: any) {
        // If the record is already gone, that's a success for our purposes.
        if (e.message?.includes('ENTITY_IS_DELETED') || e.message?.includes('NOT_FOUND')) {
             console.log(`${objectType} with ID ${recordId} was already deleted.`);
             return true;
        }
        console.error(`Failed to delete ${objectType} with ID ${recordId}:`, e.message);
        throw e; // Re-throw the error if it's not a "not found" error
    }
}


async function upsertApexClass(auth: SfdcAuth, className: string, body: string): Promise<string> {
  const existingRecord = await findToolingApiRecord(auth, 'ApexClass', className);
  if (existingRecord) {
      await deleteToolingApiRecord(auth, 'ApexClass', existingRecord.Id);
      // Wait a moment for deletion to propagate
      await sleep(1000); 
  }
  
  const createRes = await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/ApexClass/`, {
    method: 'POST',
    body: JSON.stringify({ Body: body, Name: className }),
  });
  return createRes.id;
}


async function upsertApexTrigger(auth: SfdcAuth, triggerName: string, body: string, objectName: string): Promise<string> {
    const existingRecord = await findToolingApiRecord(auth, 'ApexTrigger', triggerName);
    if (existingRecord) {
        await deleteToolingApiRecord(auth, 'ApexTrigger', existingRecord.Id);
        // Wait a moment for deletion to propagate
        await sleep(1000);
    }
    
    const createRes = await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/ApexTrigger`, {
        method: 'POST',
        body: JSON.stringify({
            Body: body,
            Name: triggerName,
            TableEnumOrId: objectName,
        }),
    });
    return createRes.id;
}


async function salesforceExecuteTestClass(
  userId: string,
  userCode: string,
  testCode: string,
  creds: SfdcAuth,
  problem: Partial<Question>
): Promise<{ success: boolean; logs: string; error?: string }> {

  const auth = creds;
  if (!auth.instanceUrl || !auth.accessToken) {
    return { success: false, logs: "", error: "Salesforce credentials not set." };
  }

  const sanitizedUserCode = sanitizeApexCode(userCode);
  const sanitizedTestCode = sanitizeApexCode(testCode);

  const { name: userObjectName, type: userObjectType } = getSObjectName(sanitizedUserCode);
  const { name: testClassName } = getSObjectName(sanitizedTestCode);

  if (!userObjectName) {
    return { success: false, logs: "", error: `No class or trigger definition found in your solution code.` };
  }
  if (!testClassName) {
    return { success: false, logs: "", error: "No test class definition found in problem test cases." };
  }

  try {
    // 1. Upload main Apex class or trigger
    if (userObjectType === 'Class') {
        await upsertApexClass(auth, userObjectName, sanitizedUserCode);
    } else if (userObjectType === 'Trigger' && problem.object) {
        await upsertApexTrigger(auth, userObjectName, sanitizedUserCode, problem.object);
    } else {
        return { success: false, logs: "", error: "Unsupported metadata type or missing object for trigger." };
    }

    // 2. Upload test class
    await upsertApexClass(auth, testClassName, sanitizedTestCode);

    // 3. Execute test asynchronously
    const runRes = await sfdcFetch(auth, `/services/data/v60.0/tooling/runTestsAsynchronous/`, {
      method: "POST",
      body: JSON.stringify({ classNames: testClassName }),
    });

    const asyncJobId = runRes || null;
    if (!asyncJobId) throw new Error("Failed to start asynchronous test run.");

    // 4. Poll for completion
    let status = "Queued";
    for (let i = 0; i < 30; i++) {
      await sleep(2000);
      const job = await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/AsyncApexJob/${asyncJobId}`);
      status = job?.Status;
      if (["Completed", "Failed", "Aborted"].includes(status)) break;
    }

    if (status !== "Completed") {
      throw new Error(`Test run did not complete successfully. Status: ${status}`);
    }

    // 5. Fetch test results
    const resultQuery = `SELECT ApexClassId, Outcome, MethodName, Message, StackTrace, ApexLogId FROM ApexTestResult WHERE AsyncApexJobId = '${asyncJobId}'`;
    const resultData = await sfdcFetch(auth, `/services/data/v60.0/tooling/query?q=${encodeURIComponent(resultQuery)}`);

    const failedTest = resultData.records.find((r: any) => r.Outcome !== "Pass");
    const logId = resultData.records[0]?.ApexLogId;
    const logs = logId
      ? await sfdcFetch(auth, `/services/data/v60.0/tooling/sobjects/ApexLog/${logId}/Body`)
      : "No logs found.";

    if (failedTest) {
      return {
        success: false,
        logs,
        error: `❌ Test Failed: ${failedTest.MethodName}\n${failedTest.Message}\n${failedTest.StackTrace || ""}`,
      };
    }
    
    return {
      success: true,
      logs: `✅ All tests passed!\n\nLogs:\n${logs}`,
    };
  } catch (err) {
    return {
      success: false,
      logs: "",
      error: err instanceof Error ? err.message : "Unknown error while running test class.",
    };
  }
}

export async function executeSalesforceCode(
    auth: SfdcAuth,
    code: string,
    executionType: 'anonymous' | 'class' | 'soql' | 'test class',
    testCode?: string,
    userId?: string, // Optional: Only needed for operations that modify user data, like test submission
    problem?: Partial<Question>
): Promise<{ success: boolean; result?: any; logs: string; error?: string; }> {
    try {
        if (!auth || !auth.instanceUrl || !auth.accessToken) {
             throw new Error('Salesforce credentials are not configured or are invalid.');
        }

        if (executionType === 'soql') {
            const endpoint = `${auth.instanceUrl}/services/data/v60.0/query`;
            const urlWithQuery = new URL(endpoint);
            urlWithQuery.searchParams.append('q', code);
            const response = await fetch(urlWithQuery.toString(), {
                method: 'GET',
                headers: { 'Authorization': `Bearer ${auth.accessToken}` },
            });
            const responseBody = await response.json();

            if (!response.ok) {
                const errorMessage = responseBody[0]?.message || 'SOQL query failed.';
                return { success: false, error: errorMessage, logs: JSON.stringify(responseBody, null, 2) };
            }
            return { success: true, result: responseBody, logs: JSON.stringify(responseBody, null, 2) };
        } else if (executionType === 'anonymous') {
             return await salesforceExecuteAnonymous(code, auth);
        } else if (executionType === 'test class' && testCode && userId && problem) {
            return await salesforceExecuteTestClass(userId, code, testCode, auth, problem);
        }
        
        throw new Error(`Unsupported execution type or missing parameters: ${executionType}`);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown server error occurred.';
        return {
            success: false,
            error: `An unexpected error occurred: ${errorMessage}`,
            logs: "No debug log available due to error.",
        };
    }
}


export async function deleteSalesforceMetadata(
  auth: SfdcAuth,
  userCode: string,
  testCode: string
): Promise<{ success: boolean, error?: string }> {
  try {
    const { name: userObjectName, type: userObjectType } = getSObjectName(userCode);
    const { name: testClassName } = getSObjectName(testCode);

    if (userObjectName) {
      const record = await findToolingApiRecord(auth, userObjectType!, userObjectName);
      if (record) {
        await deleteToolingApiRecord(auth, userObjectType!, record.Id);
      }
    }

    if (testClassName) {
      const record = await findToolingApiRecord(auth, 'ApexClass', testClassName);
      if (record) {
        await deleteToolingApiRecord(auth, 'ApexClass', record.Id);
      }
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteUserAccount(userId: string): Promise<{ success: boolean, error?: string }> {
    try {
        // Delete user from Firebase Authentication
        await getAuth().deleteUser(userId);

        // Delete user document from Firestore
        const userDocRef = firestore.collection('users').doc(userId);
        await deleteDoc(userDocRef);

        // Revalidate paths if needed, for example, the user's profile page
        // revalidatePath('/profile'); // This is client-side, would need to be handled differently

        return { success: true };

    } catch (error: any) {
        console.error("Error deleting user account:", error);
        
        let errorMessage = "An unknown error occurred while deleting your account.";
        if (error.code === 'auth/requires-recent-login') {
            errorMessage = "This is a sensitive operation and requires you to have recently logged in. Please log out and log back in before trying again.";
        } else if (error.code === 'auth/user-not-found') {
            // This can happen if the auth user was already deleted but firestore failed.
            // We can consider this a partial success, but we'll report an error for clarity.
             const userDocRef = firestore.collection('users').doc(userId);
             await deleteDoc(userDocRef);
             return { success: true };
        }
        
        return { success: false, error: errorMessage };
    }
}

export async function installSalesforcePackage(auth: SfdcAuth, packageVersionKey: string): Promise<{ success: boolean, error?: string }> {
  try {
    const res = await sfdcFetch(auth, '/services/data/v59.0/tooling/sobjects/PackageInstallRequest', {
      method: 'POST',
      body: JSON.stringify({
        SubscriberPackageVersionKey: packageVersionKey,
        SecurityType: 'Full',
      }),
    });

    const requestId = res.id;
    if (!requestId) {
      throw new Error('Failed to create PackageInstallRequest.');
    }

    let status = 'IN_PROGRESS';
    for (let i = 0; i < 60; i++) { // Poll for up to 5 minutes (60 * 5s)
      await new Promise(r => setTimeout(r, 5000));
      const statusRes = await sfdcFetch(auth, `/services/data/v59.0/tooling/sobjects/PackageInstallRequest/${requestId}`);
      status = statusRes.Status;

      if (status === 'SUCCESS') {
        return { success: true };
      }
      if (status === 'ERROR') {
        console.error('Package installation error:', statusRes.Errors);
        throw new Error(`Package installation failed: ${JSON.stringify(statusRes.Errors)}`);
      }
    }

    throw new Error('Package installation timed out.');

  } catch (error: any) {
    console.error('installSalesforcePackage error:', error);
    return { success: false, error: error.message };
  }
}
