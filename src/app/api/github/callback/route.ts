
import { NextRequest, NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';
import { firestore } from '@/firebase/server-init';
import { createAppAuth } from '@octokit/auth-app';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const installationId = searchParams.get('installation_id');
  const setupAction = searchParams.get('setup_action');
  const error = searchParams.get('error');
  const userId = searchParams.get('state'); // Get user ID from state parameter

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.headers.get('origin') || 'http://localhost:8080';
  const redirectUrl = new URL('/settings/connected-apps', baseUrl);


  if (error) {
    console.error(`GitHub App installation error: ${error}`);
    redirectUrl.searchParams.set('error', 'github_install_failed');
    return NextResponse.redirect(redirectUrl);
  }
  
  if (!userId) {
    console.error('User not authenticated during GitHub callback (missing state).');
    redirectUrl.searchParams.set('error', 'github_auth_required');
    return NextResponse.redirect(redirectUrl);
  }

  if (setupAction === 'install' && installationId) {
    try {
        const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(/\\n/g, '\n');
        const appId = process.env.GITHUB_APP_ID;

        if (!privateKey || !appId) {
            throw new Error('GitHub App server configuration is missing.');
        }

        const auth = createAppAuth({
            appId,
            privateKey,
        });

        const installationAuth = await auth({
            type: 'installation',
            installationId: parseInt(installationId, 10),
        });

        const octokit = new Octokit({ auth: installationAuth.token });

        const { data: installationRepos } = await octokit.apps.listReposAccessibleToInstallation();
        const repo = installationRepos.repositories[0]?.full_name;

        if (!repo) {
            throw new Error('No repository found for this installation. Please ensure you select at least one repository during installation.');
        }
        
        const userDocRef = firestore.collection('users').doc(userId);
        
        // Use set with merge:true to prevent errors if the document doesn't exist yet.
        await userDocRef.set({
            githubSync: {
                connected: true,
                installationId: parseInt(installationId, 10),
                repo: repo,
            },
        }, { merge: true });
        
        redirectUrl.searchParams.set('success', 'github_connected');
        return NextResponse.redirect(redirectUrl);

    } catch (e: any) {
        console.error('Failed to update user with GitHub installation:', e.message || e);
        console.error('Full error object:', JSON.stringify(e, null, 2));
        redirectUrl.searchParams.set('error', 'github_update_failed');
        return NextResponse.redirect(redirectUrl);
    }

  } else {
    redirectUrl.searchParams.set('error', 'github_invalid_setup');
    return NextResponse.redirect(redirectUrl);
  }
}
