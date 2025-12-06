
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp();
} else {
  adminApp = getApp();
}

export const firestore = getFirestore(adminApp);
