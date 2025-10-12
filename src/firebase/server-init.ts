
import { initializeApp, getApps, getApp, App, applicationDefault } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

if (!getApps().length) {
  // When running in a Google Cloud environment like Firebase App Hosting,
  // the SDK will automatically use the appropriate service account credentials
  // without any configuration if no credential is provided.
  // For local development, we use Application Default Credentials (ADC)
  // by calling `gcloud auth application-default login` in the terminal.
  const credential = process.env.GCLOUD_PROJECT ? applicationDefault() : undefined;
  adminApp = initializeApp({ credential });
} else {
  adminApp = getApp();
}

export const firestore = getFirestore(adminApp);
