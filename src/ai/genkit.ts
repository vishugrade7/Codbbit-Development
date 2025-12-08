
import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {googleCloud} from '@genkit-ai/google-cloud';
import {initializeApp, getApps, App, cert} from 'firebase-admin/app';

const firebaseAdminApp = (): Plugin => {
  return {
    name: 'firebase-admin',
    async onInit() {
      if (!getApps().length) {
        if (process.env.GCLOUD_PROJECT) {
          initializeApp();
        } else {
          // This should only happen in local dev.
          // You must have GOOGLE_APPLICATION_CREDENTIALS set.
          initializeApp();
        }
      }
    },
  };
};

export const ai = genkit({
  plugins: [firebaseAdminApp(), googleAI(), googleCloud()],
  model: 'googleai/gemini-2.5-flash',
});
