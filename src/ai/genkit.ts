import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';
import {initializeApp, getApps} from 'firebase-admin/app';

// Initialize Firebase Admin for server-side operations
if (!getApps().length) {
  initializeApp();
}

/**
 * Genkit instance initialized with the Google AI plugin.
 * Removed googleCloud() plugin to avoid OpenTelemetry build errors in Next.js 15.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
