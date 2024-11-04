import { defineEvent } from '@restackio/ai/event';

export type CreateReleaseEventInput = {
  userMessage: string;
};

export type CreateReleaseEvent = {
  assistantMessage: string;
};

export const createReleaseEvent =
  defineEvent<CreateReleaseEvent>('createRelease');
