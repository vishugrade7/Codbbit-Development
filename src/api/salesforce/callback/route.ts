

import { NextRequest, NextResponse } from 'next/server';
import { firestore } from '@/firebase/server-init';
import type { SfdcAuth } from '@/lib/types';
import { revalidatePath } from 'next/cache';

export const runtime = "nodejs";

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

export async function POST(request: NextRequest) {
  try {
    const { code, codeVerifier, userId } = await request.json();

    if (!code || !codeVerifier || !userId) {
      return NextResponse.json({ success: false, error: "Missing required parameters: code, codeVerifier, or userId." }, { status: 400 });
    }

    const consumerKey = process.env.SALESFORCE_CONSUMER_KEY;
    const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
    const callbackUrl = process.env.NEXT_PUBLIC_SALESFORCE_CALLBACK_URL;

    if (!consumerKey || !clientSecret || !callbackUrl) {
      console.error("Salesforce server environment variables are not configured.");
      return NextResponse.json({ success: false, error: "Server configuration error." }, { status: 500 });
    }

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('client_id', consumerKey);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', callbackUrl);
    params.append('code_verifier', codeVerifier);

    const tokenResponse = await fetch('https://login.salesforce.com/services/oauth2/token', {
      method: 'POST',
      body: params,
    });
    
    const data: SalesforceTokenResponse = await tokenResponse.json();

    if (!tokenResponse.ok || data.error) {
      console.error("Salesforce token exchange failed:", data.error_description);
      return NextResponse.json({ success: false, error: data.error_description || 'Failed to exchange authorization code for token.' }, { status: 400 });
    }

    const newAuth: SfdcAuth = {
      connected: true,
      accessToken: data.access_token,
      instanceUrl: data.instance_url,
      refreshToken: data.refresh_token || '',
      issuedAt: parseInt(data.issued_at, 10),
    };
    
    const userDocRef = firestore.doc(`users/${userId}`);
    await userDocRef.update({ sfdcAuth: newAuth });
    
    revalidatePath('/settings');
    
    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[Salesforce Callback API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown server error occurred";
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
