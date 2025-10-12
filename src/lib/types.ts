
export type QuestionExample = {
  input: string | Record<string, any>;
  output: string | Record<string, any>;
  explanation?: string;
};

export type QuestionHint = {
    value: string;
}

export type Question = {
  id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  category: string;
  examples?: QuestionExample[];
  hints?: QuestionHint[];
  starterCode?: string;
  testcases?: string;
  isPremium?: boolean;
  metadataType?: string;
  object?: string; // Add object field for Triggers
};

export type ProblemSheet = {
  id: string;
  name: string;
  description?: string;
  questionIds: string[];
  createdBy: string; // User ID
  followers: number;
  // Not a stored field, dynamically calculated
  questions?: number;
};

export type Voucher = {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  isActive: boolean;
  expiresAt: string | null;
};

export type PriceConfig = {
    premiumPrice: number;
    isPaymentsEnabled?: boolean;
}

export type SalesforceCredentials = {
  instanceUrl: string;
  accessToken: string;
};

export type ExecutionType = "anonymous" | "class" | "trigger" | "test class";


export type SfdcAuth = {
    connected: boolean;
    instanceUrl: string;
    accessToken: string;
    refreshToken: string;
    issuedAt: number;
};

export type GitHubSync = {
  connected: boolean;
  installationId?: number;
  repo?: string;
};

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  username: string;
  company: string;
  country: string;
  createdAt?: string; // Add createdAt for sorting recent users
  emailVerified: boolean;
  phone: string;
  phoneVerified: boolean;
  about: string;
  avatarUrl: string;
  isEmailPublic: boolean;
  isAdmin: boolean;
  isPremium?: boolean;
  points: number;
  currentStreak: number;
  maxStreak: number;
  website?: string;
  githubUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  trailheadUrl?: string;
  fontSize?: number;
  editorTheme?: string;

  lastSolvedDate: string | null;
  activeSessionId: string;
  achievements: Record<string, any>;
  categoryPoints: Record<string, any>;
  dsaStats: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  sfdcAuth: SfdcAuth;
  githubSync?: GitHubSync;
  solvedProblems: Record<string, {
    difficulty: string;
    points: number;
    solvedAt: string;
    title: string;
    category: string;
  }>;
  starredProblems: string[];
  followedSheets?: string[];
  submissionHeatmap: Record<string, number>;
  contributions: any[];
  solvedQuestions?: string[];
}
