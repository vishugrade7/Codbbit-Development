
import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/firebase/server-init';
import { revalidatePath } from 'next/cache';

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  const userId = searchParams.get('state');

  const redirectUrl = new URL('/settings/verification', request.nextUrl.origin);

  if (error) {
    console.error(`LinkedIn OAuth error: ${errorDescription}`);
    redirectUrl.searchParams.set('error', 'linkedin_failed');
    return NextResponse.redirect(redirectUrl);
  }

  if (!code || !userId) {
    console.error('LinkedIn callback missing code or state (userId).');
    redirectUrl.searchParams.set('error', 'linkedin_missing_params');
    return NextResponse.redirect(redirectUrl);
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: process.env.LINKEDIN_CLIENT_ID!,
        client_secret: process.env.LINKEDIN_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_BASE_URL}/api/linkedin/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (!tokenResponse.ok) {
      throw new Error(tokenData.error_description || 'Failed to get LinkedIn access token.');
    }
    
    const accessToken = tokenData.access_token;

    // Fetch user profile from LinkedIn
    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const profileData = await profileResponse.json();
    if (!profileResponse.ok) {
      throw new Error('Failed to fetch LinkedIn profile.');
    }
    
    // Update user document in Firestore
    const userDocRef = firestore.collection('users').doc(userId);
    await userDocRef.update({
      emailVerified: true, // Mark as verified
      linkedinUrl: profileData.picture // LinkedIn userinfo endpoint returns picture URL, not profile URL. This is a limitation of the available scopes.
    });

    revalidatePath('/settings/verification');
    revalidatePath('/settings');
    
    redirectUrl.searchParams.set('success', 'linkedin_verified');
    return NextResponse.redirect(redirectUrl);

  } catch (e: any) {
    console.error('LinkedIn callback error:', e.message);
    redirectUrl.searchParams.set('error', 'linkedin_error');
    return NextResponse.redirect(redirectUrl);
  }
}
