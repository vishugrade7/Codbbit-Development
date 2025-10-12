
'use server';

/**
 * @fileOverview An AI agent for generating coding problem details.
 *
 * - generateProblem - A function that generates starter code and test cases.
 * - GenerateProblemInput - The input type for the generateProblem function.
 * - GenerateProblemOutput - The return type for the generateProblem function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProblemInputSchema = z.object({
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).describe('The difficulty of the problem.'),
  category: z.string().describe('The category of the problem (e.g., SOQL, Apex Triggers).'),
  title: z.string().describe('The title of the coding problem.'),
  metadataType: z.string().optional().describe("The type of Apex metadata to generate, e.g., 'Class' or 'Trigger'."),
  object: z.string().optional().describe("The Salesforce object for the trigger, e.g., 'Account' or 'Contact'. Required if metadataType is 'Trigger'."),
});
export type GenerateProblemInput = z.infer<typeof GenerateProblemInputSchema>;

const GenerateProblemOutputSchema = z.object({
  description: z.string().describe('The detailed description of the coding problem.'),
  starterCode: z.string().describe('The initial Apex code snippet for the user to start with.'),
  testcases: z.string().describe('The Apex test class to validate the user\'s solution.'),
  examples: z.array(z.object({
    input: z.string(),
    output: z.string(),
    explanation: z.string().optional(),
  })).describe('An array of examples with input, output, and optional explanation.'),
  hints: z.array(z.object({
      value: z.string()
  })).describe('An array of hint objects.'),
});
export type GenerateProblemOutput = z.infer<typeof GenerateProblemOutputSchema>;

export async function generateProblem(
  input: GenerateProblemInput
): Promise<GenerateProblemOutput> {
  return generateProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProblemPrompt',
  input: {schema: GenerateProblemInputSchema},
  output: {schema: GenerateProblemOutputSchema},
  prompt: `You are an expert Salesforce Apex developer and technical instructor. Given the problem title, category, difficulty, and metadata type, generate a high-quality Apex coding problem.

Problem Title: {{{title}}}
Problem Category: {{{category}}}
Problem Difficulty: {{{difficulty}}}
{{#if metadataType}}
Metadata Type: {{{metadataType}}}
{{/if}}
{{#if object}}
Salesforce Object: {{{object}}}
{{/if}}


Your task is to create:
1.  **Description**: A clear and concise description of the problem, explaining the goal, any constraints, and what the expected input and output are.
{{#if object}}
2.  **Starter Code**: An Apex trigger for the '{{{object}}}' object. The trigger must be a single, self-contained file without a separate handler class. The logic should be within the trigger body. Provide a clear starting point for the user.
{{else}}
2.  **Starter Code**: An Apex class and method signature that provides a clear starting point for the user. The method body should be empty or contain only a placeholder comment.
{{/if}}
3.  **Test Cases**: A complete and robust Apex test class that validates the solution. It should include multiple test methods covering different scenarios (e.g., positive cases, negative cases, edge cases, bulk data). The test class must be annotated with '@isTest'.
4.  **Examples**: At least two clear examples with input, output, and a brief explanation.
5.  **Hints**: At least two helpful hints as an array of objects with a "value" key.

The generated code and content must be valid and follow best practices.`,
});

const generateProblemFlow = ai.defineFlow(
  {
    name: 'generateProblemFlow',
    inputSchema: GenerateProblemInputSchema,
    outputSchema: GenerateProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
