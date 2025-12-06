
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
import { Query } from 'firebase-admin/firestore';

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
      const usersRef = firestore().collection('users');
      
      // Create two queries: one for the exact match and one for the lowercase match.
      const exactMatchQuery = usersRef.where('username', '==', username).limit(1);
      const lowerCaseQuery = usersRef.where('username_lowercase', '==', username.toLowerCase()).limit(1);

      // Execute both queries
      const [exactMatchSnapshot, lowerCaseSnapshot] = await Promise.all([
        exactMatchQuery.get(),
        lowerCaseQuery.get()
      ]);

      let userDoc;

      if (!exactMatchSnapshot.empty) {
        userDoc = exactMatchSnapshot.docs[0];
      } else if (!lowerCaseSnapshot.empty) {
        userDoc = lowerCaseSnapshot.docs[0];
      } else {
        return null;
      }

      const userProfile = { ...userDoc.data(), uid: userDoc.id } as UserProfile;
      
      // Calculate rank
      const rankQuery = await usersRef.where('points', '>', userProfile.points || 0).count().get();
      userProfile.rank = rankQuery.data().count + 1;

      return userProfile;
      
    } catch (error) {
      console.error('Error fetching user by username:', String(error));
      // In a real app, you might want more robust error handling or logging.
      return null;
    }
  }
);
