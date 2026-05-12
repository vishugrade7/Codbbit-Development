import {genkit, Plugin} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {initializeApp, getApps, getApp} from 'firebase-admin/app';

const firebaseAdminApp = (): Plugin => {
  return {
    name: 'firebase-admin',
    async onInit() {
      if (!getApps().length) {
        initializeApp();
      }
    },
  };
};

export const ai = genkit({
  plugins: [firebaseAdminApp(), googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
