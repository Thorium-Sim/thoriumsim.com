export interface User {
  displayName: string;
  email: string;
  bio?: string;
  profileUrl?: string;
  secret: string;
  isAdmin?: boolean;
  feedback_upvotes?: number[];
}

export type FeedbackCategories =
  | "Bug"
  | "Enhancement"
  | "Feature"
  | "Question"
  | "Compliment";
export type FeedbackStatus =
  | "Duplicate"
  | "Blocked"
  | "Complete"
  | "In-Progress"
  | "Open";
export interface Feedback {
  // TODO: Implement ownership for these
  owner?: unknown;
  owner_email?: string | null;
  owner_displayName?: string | null;
  timestamp: number;
  status: FeedbackStatus;
  title: string;
  version: string | null;
  category: FeedbackCategories;
  github_number: number;
  upvotes: number;
}

export interface FeedbackComment {
  id?: number;
  // TODO: Implement ownership for these
  owner?: unknown;
  owner_email?: string | null;
  owner_displayName?: string | null;
  timestamp: number;
  body: string | null;
}
export type GHIssue =
  | {
      number: number;
    }
  | {error: string};

export interface UploadData {
  authorizationToken: string;
  bucketId: string;
  uploadUrl: string;
}
