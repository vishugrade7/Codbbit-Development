'use server';

/**
 * @fileOverview An AI agent that answers questions about a coding problem.
 *
 * - askQuestion - A function that provides answers to user questions.
 * - AskQuestionInput - The input type for the askQuestion function.
 * - AskQuestionOutput - The return type for the askQuestion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AskQuestionInputSchema = z.object({
  question: z.string().describe('The user\'s question about the coding problem.'),
  problemContext: z.object({
    title: z.string(),
    description: z.string(),
    starterCode: z.string().optional(),
    userCode: z.string().describe('The code the user has written so far.'),
  }),
});
export type AskQuestionInput = z.infer<typeof AskQuestionInputSchema>;

const AskQuestionOutputSchema = z.object({
  answer: z.string().describe('The AI\'s helpful, non-solution answer to the user\'s question.'),
});
export type AskQuestionOutput = z.infer<typeof AskQuestionOutputSchema>;

export async function askQuestion(
  input: AskQuestionInput
): Promise<AskQuestionOutput> {
  return askQuestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'askQuestionPrompt',
  input: {schema: AskQuestionInputSchema},
  output: {schema: AskQuestionOutputSchema},
  prompt: `You are a Salesforce Apex programming tutor. A user is asking for help with a coding problem.
Your goal is to guide them to the solution without giving it away. Analyze their question in the context of the problem and their current code.

**CRITICAL RULE: DO NOT provide the complete, final solution code. Instead, provide explanations, hints, or corrected snippets of *their* code.**

Problem Title: {{{problemContext.title}}}
Problem Description: {{{problemContext.description}}}
User's Code:
\'\'\'apex
{{{problemContext.userCode}}}
\'\'\'

User's Question: "{{{question}}}"

Your Answer:`,
});

const askQuestionFlow = ai.defineFlow(
  {
    name: 'askQuestionFlow',
    inputSchema: AskQuestionInputSchema,
    outputSchema: AskQuestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
