
'use server';

import { firestore } from '@/firebase/server-init';
import { getAuth } from 'firebase-admin/auth';
import { createAppAuth } from '@octokit/auth-app';
import { Octokit } from '@octokit/rest';

async function getAuthenticatedOctokit(userId: string): Promise<Octokit> {
    const userDoc = await firestore.collection('users').doc(userId).get();
    const userData = userDoc.data();

    if (!userData?.githubSync?.connected || !userData.githubSync.installationId) {
        throw new Error('GitHub account not connected or installation ID is missing.');
    }

    const installationId = userData.githubSync.installationId;
    const privateKey = process.env.GITHUB_PRIVATE_KEY;
    const appId = process.env.NEXT_PUBLIC_GITHUB_APP_ID;

    if (!privateKey || !appId) {
        throw new Error('GitHub App configuration is missing on the server.');
    }
    
    const auth = createAppAuth({
        appId: appId,
        privateKey: privateKey,
    });
    
    const installationAuth = await auth({
        type: 'installation',
        installationId: installationId,
    });

    return new Octokit({ auth: installationAuth.token });
}


export async function getSolutionFromGitHub(userId: string, problemTitle: string): Promise<{ success: boolean; content?: string; error?: string; }> {
    try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        const userData = userDoc.data();
        
        if (!userData?.githubSync?.connected || !userData.githubSync.repo) {
            return { success: false, error: 'GitHub not configured for this user.' };
        }

        const octokit = await getAuthenticatedOctokit(userId);
        const owner = userData.githubSync.repo.split('/')[0];
        const repo = userData.githubSync.repo.split('/')[1];
        const path = `salesforce-coder-solutions/${problemTitle}.cls`;

        const { data } = await octokit.repos.getContent({
            owner,
            repo,
            path,
        });

        if ('content' in data) {
            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            return { success: true, content };
        } else {
            return { success: false, error: 'File content not found.' };
        }

    } catch (error: any) {
        if (error.status === 404) {
            return { success: false, error: 'Solution file not found in repository.' };
        }
        console.error(`Error fetching from GitHub: ${error.message}`);
        return { success: false, error: `Failed to fetch solution from GitHub: ${error.message}` };
    }
}


export async function pushSolutionToGitHub(userId: string, problemTitle: string, content: string): Promise<{ success: boolean; message: string; error?: string }> {
    try {
        const userDoc = await firestore.collection('users').doc(userId).get();
        const userData = userDoc.data();

        if (!userData?.githubSync?.connected || !userData.githubSync.repo) {
            return { success: false, message: '', error: 'GitHub not configured for this user.' };
        }

        const octokit = await getAuthenticatedOctokit(userId);
        const [owner, repo] = userData.githubSync.repo.split('/');
        const path = `salesforce-coder-solutions/${problemTitle}.cls`;
        const message = `feat: add solution for ${problemTitle}`;
        const contentEncoded = Buffer.from(content).toString('base64');
        
        let sha: string | undefined;
        try {
            const { data } = await octokit.repos.getContent({ owner, repo, path });
            if ('sha' in data) {
              sha = data.sha;
            }
        } catch (error: any) {
            // If file doesn't exist, it's a new file, which is fine.
            if (error.status !== 404) {
                throw error;
            }
        }

        await octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path,
            message,
            content: contentEncoded,
            sha,
        });

        return { success: true, message: `Successfully pushed solution for ${problemTitle} to GitHub.` };
    } catch (error: any) {
        console.error(`GitHub push failed: ${error.message}`);
        return { success: false, message: '', error: `Failed to push solution to GitHub: ${error.message}` };
    }
}
