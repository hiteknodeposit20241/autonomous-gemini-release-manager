import { defineEvent } from '@restackio/ai/event';

type Commit = {
  username: string;
  message: string;
  modified: string[];
};

export type NewCommitEventInput = {
  repository: string;
  branch: string;
  defaultBranch: string;
  commits: Commit[];
};

export type NewCommitEvent = {
  assistantMessage: string;
};

export const newCommitEvent = defineEvent<NewCommitEvent>('newCommit');
