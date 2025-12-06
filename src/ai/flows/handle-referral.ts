
'use server';

/**
 * @fileOverview A secure flow for handling user referrals.
 * - handleReferral - Increments the referrer's user count.
 * - HandleReferralInput - Input schema for the flow.
 * - HandleReferralOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { firestore } from '@/firebase/server-init';
import { FieldValue } from 'firebase-admin/firestore';

const HandleReferralInputSchema = z.object({
  referralCode: z.string().describe('The referral code used for sign-up.'),
});
export type HandleReferralInput = z.infer<typeof HandleReferralInputSchema>;

const HandleReferralOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});
export type HandleReferralOutput = z.infer<typeof HandleReferralOutputSchema>;

export async function handleReferral(
  input: HandleReferralInput
): Promise<HandleReferralOutput> {
  return handleReferralFlow(input);
}

const handleReferralFlow = ai.defineFlow(
  {
    name: 'handleReferralFlow',
    inputSchema: HandleReferralInputSchema,
    outputSchema: HandleReferralOutputSchema,
  },
  async ({ referralCode }) => {
    if (!referralCode) {
      return { success: false, message: 'No referral code provided.' };
    }

    try {
      const usersRef = firestore().collection('users');
      const q = usersRef.where('referralCode', '==', referralCode).limit(1);
      const querySnapshot = await q.get();

      if (querySnapshot.empty) {
        return { success: false, message: 'Invalid referral code.' };
      }

      const referringUserDoc = querySnapshot.docs[0];
      await referringUserDoc.ref.update({
        referredUsersCount: FieldValue.increment(1),
      });

      return { success: true, message: 'Referral count updated.' };
    } catch (error) {
      console.error('Error handling referral:', String(error));
      return { success: false, message: 'An error occurred while processing the referral.' };
    }
  }
);
