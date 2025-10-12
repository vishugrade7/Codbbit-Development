
import type { Question } from './types';

export const seedData: Omit<Question, 'id'>[] = [
  {
    title: 'Sample: Add Two Numbers',
    description: 'Given two integers, return their sum.',
    difficulty: 'Easy',
    category: 'Apex Basics',
    tags: ['Apex', 'Math'],
    starterCode:
      'public class Solution {\n    public static Integer add(Integer a, Integer b) {\n        // Your code here\n        return null;\n    }\n}',
    testcases:
      '@isTest\nprivate class SolutionTest {\n    @isTest\n    static void testPositiveNumbers() {\n        System.assertEquals(5, Solution.add(2, 3), \'Test with positive numbers failed.\');\n    }\n\n    @isTest\n    static void testNegativeNumbers() {\n        System.assertEquals(-5, Solution.add(-2, -3), \'Test with negative numbers failed.\');\n    }\n}',
    examples: [
      {
        input: 'a = 2, b = 3',
        output: '5',
        explanation: 'The sum of 2 and 3 is 5.',
      },
    ],
    hints: ['Use the `+` operator.'],
  },
];
