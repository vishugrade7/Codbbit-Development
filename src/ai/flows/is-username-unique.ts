
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
      const usersRef = firestore.collection('users');
      // Perform a case-insensitive check by querying a lowercase version of the username
      const q = usersRef.where('username_lowercase', '==', username.toLowerCase()).limit(1);
      const querySnapshot = await q.get();

      if (querySnapshot.empty) {
        return { isUnique: true };
      }
      
      const existingUser = querySnapshot.docs[0].data();
      return { 
          isUnique: false, 
          existingUserName: 
            existingUser.name ||
            existingUser.username ||
            existingUser.displayName ||
            existingUser.fullName ||
            'another user'
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
