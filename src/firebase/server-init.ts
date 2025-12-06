
import { initializeApp, getApps, getApp, App } from 'firebase-admin/app';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';

let adminApp: App;

if (!getApps().length) {
  adminApp = initializeApp();
} else {
  adminApp = getApp();
}

const db = getAdminFirestore(adminApp);

export function firestore() {
  return db;
}
