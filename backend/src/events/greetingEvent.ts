import { defineEvent } from '@restackio/ai/event';

export type GreetingEvent = {
  assistantMessage: string;
};

export const greetingEvent = defineEvent<GreetingEvent>('greeting');
