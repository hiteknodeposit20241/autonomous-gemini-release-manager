import { defineEvent } from '@restackio/ai/event';

export type NewCommitEventInput = {
  repository: string;
  compareUrl: string;
  author: string;
  commitMessage: string;
};

export type NewCommitEvent = {
  repository: string;
  compareUrl: string;
  author: string;
  commitMessage: string;
  assistantMessage: string;
};

export const newCommitEvent = defineEvent<NewCommitEvent>('newCommit');
