'use server';

/**
 * @fileOverview A secure flow for fetching a user's rank based on points.
 * - getUserRank - Calculates a user's rank.
 * - GetUserRankInput - Input schema for the flow.
 * - GetUserRankOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { firestore } from '@/firebase/server-init';

const GetUserRankInputSchema = z.object({
  points: z.number().describe('The points of the user to rank.'),
});
export type GetUserRankInput = z.infer<typeof GetUserRankInputSchema>;

const GetUserRankOutputSchema = z.object({
  rank: z.number(),
});
export type GetUserRankOutput = z.infer<typeof GetUserRankOutputSchema>;

export async function getUserRank(
  input: GetUserRankInput
): Promise<GetUserRankOutput> {
  return getUserRankFlow(input);
}

const getUserRankFlow = ai.defineFlow(
  {
    name: 'getUserRankFlow',
    inputSchema: GetUserRankInputSchema,
    outputSchema: GetUserRankOutputSchema,
  },
  async ({ points }) => {
    try {
      const usersRef = firestore.collection('users');
      // Count users with more points
      const q = usersRef.where('points', '>', points);
      const querySnapshot = await q.get();

      // Rank is 1 + the number of users with more points
      const rank = querySnapshot.size + 1;

      return { rank };
    } catch (error) {
      console.error('Error calculating user rank:', String(error));
      // In case of an error, return a default high rank
      return { rank: 9999 };
    }
  }
);
