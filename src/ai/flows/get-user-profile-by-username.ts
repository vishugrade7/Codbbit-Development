'use server';

/**
 * @fileOverview A secure flow for fetching a user's profile by their username.
 * - getUserProfileByUsername - Fetches a user profile from Firestore based on username.
 * - GetUserProfileByUsernameInput - Input schema for the flow.
 * - GetUserProfileByUsernameOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { firestore } from '@/firebase/server-init';
import type { UserProfile } from '@/lib/types';

const GetUserProfileByUsernameInputSchema = z.object({
  username: z.string().describe('The username of the user to fetch.'),
});
export type GetUserProfileByUsernameInput = z.infer<
  typeof GetUserProfileByUsernameInputSchema
>;

const GetUserProfileByUsernameOutputSchema = z.custom<UserProfile | null>();
export type GetUserProfileByUsernameOutput = z.infer<
  typeof GetUserProfileByUsernameOutputSchema
>;

export async function getUserProfileByUsername(
  input: GetUserProfileByUsernameInput
): Promise<GetUserProfileByUsernameOutput> {
  return getUserProfileByUsernameFlow(input);
}

const getUserProfileByUsernameFlow = ai.defineFlow(
  {
    name: 'getUserProfileByUsernameFlow',
    inputSchema: GetUserProfileByUsernameInputSchema,
    outputSchema: GetUserProfileByUsernameOutputSchema,
  },
  async ({ username }) => {
    if (!username) {
      return null;
    }

    try {
      const usersRef = firestore.collection('users');
      const q = usersRef.where('username', '==', username).limit(1);
      const querySnapshot = await q.get();

      if (querySnapshot.empty) {
        return null;
      }

      const userDoc = querySnapshot.docs[0];
      return { ...userDoc.data(), uid: userDoc.id } as UserProfile;
    } catch (error) {
      console.error('Error fetching user by username:', String(error));
      // In a real app, you might want more robust error handling or logging.
      return null;
    }
  }
);
