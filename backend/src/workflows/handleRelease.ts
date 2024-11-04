import { Content } from '@google-cloud/vertexai';
import { condition, step, log } from '@restackio/ai/workflow';
import { onEvent } from '@restackio/ai/event';
import * as githubFunctions from '@restackio/integrations-github/functions';
import { githubTaskQueue } from '@restackio/integrations-github/taskQueue';

import * as functions from '../functions/index.js';

import {
  createReleaseEvent,
  CreateReleaseEventInput,
} from '../events/createRelease.js';

import { greetingEvent } from '../events/greetingEvent.js';

import { newCommitEvent, NewCommitEventInput } from '../events/newCommit.js';

export async function handleReleaseWorkflow() {
  let endReleaseWorkflow = false;
  let chatHistory: Content[] = [];
  let repo = '';
  let repoBranch = '';

  onEvent(greetingEvent, async () => {
    log.info('Greeting event received');
    const { response, history } = await step<typeof functions>(
      {},
    ).generateAiContent({
      systemContent:
        'You are a helpful assistant that will assist the user in creating github releases whenever a commit event is detected.',
      userContent:
        'Greet the user as this is the initial message. Let them know that whenever a new commit is detected you will ask them to confirm if they want to create a release based on the commits.',
      chatHistory,
    });

    chatHistory = history;

    return { assistantMessage: response };
  });

  onEvent(
    newCommitEvent,
    async ({
      repository,
      branch,
      defaultBranch,
      commits,
    }: NewCommitEventInput) => {
      const { response, history } = await step<typeof functions>(
        {},
      ).generateAiContent({
        systemContent:
          'New commits have been detected. You will be provided with information about the commits. You will get the username that authored the commit, message of the commit and the files that were modified. Please respond with a message that confirms you have received the commits and you will ask the user if they want to create a release based on the commits. On your message please include the commits information',
        userContent: `
          Here is the information about the commits:
          Repository: ${repository}
          Branch: ${branch}
          Default Branch: ${defaultBranch}
          Commits: ${JSON.stringify(commits, null, 2)}
        `,
        chatHistory,
      });

      chatHistory = history;
      repo = repository;
      repoBranch = branch;
      defaultBranch = defaultBranch;

      return { assistantMessage: response };
    },
  );

  onEvent(
    createReleaseEvent,
    async ({ userMessage }: CreateReleaseEventInput) => {
      const confirmReleaseResponse = await step<typeof functions>(
        {},
      ).generateAiContent({
        systemContent:
          'You will determine based on the user message if they want to create a release. If they do, just respond with "yes". If they do not want to create a release just respond with "no". Add no formatting on your response and all in lowercase please.',
        userContent: `
          Here is the user message: ${userMessage}
        `,
        chatHistory,
      });

      chatHistory = confirmReleaseResponse.history;

      if (confirmReleaseResponse.response?.toLowerCase()?.trim() !== 'yes') {
        const noReleaseResponse = await step<typeof functions>(
          {},
        ).generateAiContent({
          systemContent:
            'You will respond to the user with a message that confirms the release has not been created.',
          userContent: 'No release created',
          chatHistory,
        });

        chatHistory = noReleaseResponse.history;

        return { assistantMessage: noReleaseResponse.response };
      }

      const [owner, repoName] = repo.split('/');
      let latestRelease;

      try {
        latestRelease = await step<typeof githubFunctions>({
          taskQueue: githubTaskQueue,
        }).getLatestRelease({
          owner,
          repo: repoName,
        });
      } catch (error) {
        log.warn('Latest release not found, this will be first release');
      }

      let tagName: string | null = '';

      if (!latestRelease) {
        tagName = 'v1.0.0';
      } else {
        const tagNameResponse = await step<typeof functions>(
          {},
        ).generateAiContent({
          systemContent:
            'You will now determine the next tag name for a github release. You will be given the current release tag name. You will need to return the next tag name. For now only suggest a minor version bump. If the tag provided has any prefix such as "v" your suggestion should also include the "v" prefix. Only return the tag name, do not include any other text.',
          userContent: `
            Here is the current release tag name: ${latestRelease.tag_name}
          `,
          chatHistory,
        });

        chatHistory = tagNameResponse.history;

        if (!tagNameResponse.response) {
          tagName = 'v1.0.0';
        } else {
          tagName = tagNameResponse.response.trim();
        }
      }

      const release = await step<typeof githubFunctions>({
        taskQueue: githubTaskQueue,
      }).createRelease({
        owner,
        repo: repoName,
        tagName: tagName,
        releaseName: `Release ${tagName}`,
        branch: repoBranch,
        isDraft: false,
      });

      log.info('Release created', { releaseUrl: release.html_url });

      const releaseConfirmationResponse = await step<typeof functions>(
        {},
      ).generateAiContent({
        systemContent:
          'You will now respond to the user with the release url and with a message that confirms the release has been created.',
        userContent: `
          Here is the release url: ${release.html_url}
        `,
        chatHistory,
      });

      chatHistory = releaseConfirmationResponse.history;

      return { assistantMessage: releaseConfirmationResponse.response };
    },
  );

  await condition(() => endReleaseWorkflow);
}
