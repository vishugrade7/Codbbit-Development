'use server';

/**
 * @fileOverview An AI agent for providing code completion suggestions.
 *
 * - codeCompletionSuggestions - A function that suggests code completions.
 * - CodeCompletionSuggestionsInput - The input type for the codeCompletionSuggestions function.
 * - CodeCompletionSuggestionsOutput - The return type for the codeCompletionSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeCompletionSuggestionsInputSchema = z.object({
  codePrefix: z
    .string()
    .describe('The partial code that the user has typed so far.'),
});
export type CodeCompletionSuggestionsInput = z.infer<
  typeof CodeCompletionSuggestionsInputSchema
>;

const CodeCompletionSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of code completion suggestions.'),
});
export type CodeCompletionSuggestionsOutput = z.infer<
  typeof CodeCompletionSuggestionsOutputSchema
>;

export async function codeCompletionSuggestions(
  input: CodeCompletionSuggestionsInput
): Promise<CodeCompletionSuggestionsOutput> {
  return codeCompletionSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'codeCompletionSuggestionsPrompt',
  input: {schema: CodeCompletionSuggestionsInputSchema},
  output: {schema: CodeCompletionSuggestionsOutputSchema},
  prompt: `You are an AI code completion assistant for the Salesforce Apex language.  Given the following code prefix, suggest possible code completions, limited to a maximum of 5 suggestions.

Code Prefix:
{{codePrefix}}

Suggestions:`,
});

const codeCompletionSuggestionsFlow = ai.defineFlow(
  {
    name: 'codeCompletionSuggestionsFlow',
    inputSchema: CodeCompletionSuggestionsInputSchema,
    outputSchema: CodeCompletionSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
