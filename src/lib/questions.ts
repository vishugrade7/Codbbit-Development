

import type { Question } from './types';

// This file is now a fallback and might be deprecated.
// The primary source of truth for questions is now Firestore.
export const questions: Question[] = [
  {
    "id": "1",
    "title": "Two Sum",
    "description": "Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    "difficulty": 'Easy',
    "tags": ['Array', 'Hash Table'],
    "category": "Array",
    "examples": [
        {
            "input": "nums = [2,7,11,15], target = 9",
            "output": "[0,1]",
            "explanation": "Because nums[0] + nums[1] == 9, we return [0, 1]."
        }
    ],
    "hints": ["A really good way to solve this is using a hash map."],
    "starterCode": "public class Solution {\n    public static List<Integer> twoSum(List<Integer> nums, Integer target) {\n        // Your code here\n        return new List<Integer>();\n    }\n}",
  },
  {
    "id": "2",
    "title": "SOQL Active Accounts",
    "description": "Write an Apex method that returns a list of all active 'Account' records. An account is considered active if its 'Active__c' field is set to 'Yes'.",
    "difficulty": 'Easy',
    "tags": ['SOQL', 'Apex'],
    "category": "SOQL",
    "starterCode": "public class Solution {\n    public static List<Account> getActiveAccounts() {\n        // Your code here\n        return new List<Account>();\n    }\n}",
  },
];
