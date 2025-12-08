
import { initializeApp, getApps, getApp, App, credential } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import {getAuth as getAdminAuth} from 'firebase-admin/auth';

let adminApp: App;

if (!getApps().length) {
  if (process.env.GCLOUD_PROJECT) {
      adminApp = initializeApp();
  } else {
    // This will not work in production, but is useful for local dev without gcloud auth
    // For local development, you might need to set up a service account.
    // Make sure GOOGLE_APPLICATION_CREDENTIALS is set in your environment.
    adminApp = initializeApp();
  }
} else {
  adminApp = getApp();
}

const db = getAdminFirestore(adminApp);
const auth = getAdminAuth(adminApp);

export function firestore() {
  return db;
}

export function authAdmin() {
    return auth;
}
