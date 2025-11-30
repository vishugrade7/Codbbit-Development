
import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/firebase/server-init';
import { revalidatePath } from 'next/cache';
import type { GithubAuth } from '@/lib/types';

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const userId = searchParams.get('state');

  const redirectUrl = new URL('/settings/connected-apps', request.nextUrl.origin);

  if (error) {
    console.error(`GitHub OAuth error: ${errorDescription}`);
    redirectUrl.searchParams.set('error', 'github_failed');
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !userId) {
    console.error('GitHub callback missing code or state (userId).');
    redirectUrl.searchParams.set('error', 'github_missing_params');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID!,
        client_secret: process.env.GITHUB_CLIENT_SECRET!,
        code: code,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/github/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok || tokenData.error) {
      throw new Error(tokenData.error_description || 'Failed to get GitHub access token.');
    }
    
    const accessToken = tokenData.access_token;

    // Fetch user profile from GitHub
    const profileResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileResponse.json();
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch GitHub profile.');
    }
    
    // Here you would typically encrypt the access token before storing it
    const newAuth: GithubAuth = {
        connected: true,
        username: profileData.login,
        accessToken: accessToken, // IMPORTANT: Encrypt this in a real app
    };

    // Update user document in Firestore
    const userDocRef = firestore.collection('users').doc(userId);
    await userDocRef.set({
      githubAuth: newAuth
    }, { merge: true });

    revalidatePath('/settings/connected-apps');
    revalidatePath('/settings');
    
    redirectUrl.searchParams.set('success', 'github_connected');
    return NextResponse.redirect(redirectUrl);

  } catch (e: any) {
    console.error('GitHub callback error:', e.message);
    redirectUrl.searchParams.set('error', 'github_error');
    return NextResponse.redirect(redirectUrl);
  }
}
