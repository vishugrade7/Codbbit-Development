
'use server';

/**
 * @fileOverview A secure flow for checking if a username is unique.
 * - isUsernameUnique - Checks if a username is available in Firestore.
 * - IsUsernameUniqueInput - Input schema for the flow.
 * - IsUsernameUniqueOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { firestore } from '@/firebase/server-init';

const IsUsernameUniqueInputSchema = z.object({
  username: z.string().describe('The username to check.'),
});
export type IsUsernameUniqueInput = z.infer<
  typeof IsUsernameUniqueInputSchema
>;

const IsUsernameUniqueOutputSchema = z.object({
  isUnique: z.boolean(),
  existingUserName: z.string().optional(),
});
export type IsUsernameUniqueOutput = z.infer<
  typeof IsUsernameUniqueOutputSchema
>;

const isUsernameUniqueFlow = ai.defineFlow(
  {
    name: 'isUsernameUniqueFlow',
    inputSchema: IsUsernameUniqueInputSchema,
    outputSchema: IsUsernameUniqueOutputSchema,
  },
  async ({ username }) => {
    if (!username) {
      return { isUnique: false };
    }

    try {
      const db = firestore();
      const usersRef = db.collection('users');
      // Query for an exact, case-insensitive match.
      const lowerCaseQuerySnapshot = await usersRef.where('username_lowercase', '==', username.toLowerCase()).get();

      if (lowerCaseQuerySnapshot.empty) {
        return { isUnique: true };
      }
      
      const existingUserDoc = lowerCaseQuerySnapshot.docs[0];
      const existingUser = existingUserDoc.data();

      return { 
          isUnique: false, 
          existingUserName: 
            existingUser.name ||
            existingUser.username ||
            existingUser.displayName ||
            existingUser.fullName ||
            username
        };

    } catch (error) {
      console.error('Error checking username uniqueness:', String(error));
      // In case of an error, assume it's not unique to be safe
      return { isUnique: false };
    }
  }
);

export async function isUsernameUnique(
  input: IsUsernameUniqueInput
): Promise<IsUsernameUniqueOutput> {
  return isUsernameUniqueFlow(input);
}
