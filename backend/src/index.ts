import express from 'express';
import expressWs from 'express-ws';
import dotenv from 'dotenv';
import cors from 'cors';

import { client } from './client.js';

import {
  CreateReleaseEvent,
  createReleaseEvent,
} from './events/createRelease.js';
import { services } from './services.js';
import { GreetingEvent, greetingEvent } from './events/greetingEvent.js';
import { WebsocketMessage } from './websockets/types.js';
import { NewCommitEvent, newCommitEvent } from './events/newCommit.js';

dotenv.config();

const { app } = expressWs(express());
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(cors());

app.get('/', (_, res) => {
  res.send('Hello World! The server is running.');
});

let handleReleaseWorkflowId: string = 'hello';
let runId: string = '';
const connections = new Set<(data: any) => void>();

const broadcast = (eventData: any) => {
  connections.forEach((sendEvent) => {
    sendEvent(eventData);
  });
};

// webhook endpoint to receive github events
app.post('/webhook', async (req, res) => {
  console.log('Webhook received:', req.body);
  const data = req.body;

  res.status(200).send('Webhook received');

  const result = (await client.sendWorkflowEvent({
    event: {
      name: newCommitEvent.name,
      input: {
        repository: data.repository.full_name,
        branch: data.ref.replace('refs/heads/', ''),
        defaultBranch: data.repository.default_branch,
        commits: data.commits,
      },
    },
    workflow: {
      workflowId: handleReleaseWorkflowId,
      runId,
    },
  })) as NewCommitEvent;

  broadcast({ type: 'assistant-message', data: result.assistantMessage });
});

// WebSocket endpoint
app.ws('/events', (ws, req) => {
  console.log('WebSocket client connected');

  // Keep track of this connection
  const heartbeat = setInterval(() => {
    if (ws.readyState === ws.OPEN) {
      ws.ping();
    }
  }, 30000);

  // Send events to the client
  const sendEvent = (eventData: any) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(eventData));
    }
  };

  // Store the connection in a global connections pool
  // (You'll need to declare this at the top of your file)
  connections.add(sendEvent);

  // Handle client messages if needed
  ws.on('message', async (msg: string) => {
    const parsedMsg: WebsocketMessage = JSON.parse(msg);

    if (parsedMsg.type === 'greeting') {
      const result = (await client.sendWorkflowEvent({
        event: {
          name: greetingEvent.name,
        },
        workflow: {
          workflowId: handleReleaseWorkflowId,
          runId,
        },
      })) as GreetingEvent;
      sendEvent({ type: 'assistant-message', data: result.assistantMessage });
    }

    if (parsedMsg.type === 'create-release') {
      const result = (await client.sendWorkflowEvent({
        event: {
          name: createReleaseEvent.name,
          input: {
            userMessage: parsedMsg.data,
          },
        },
        workflow: {
          workflowId: handleReleaseWorkflowId,
          runId,
        },
      })) as CreateReleaseEvent;
      sendEvent({ type: 'assistant-message', data: result.assistantMessage });
    }
  });

  // Clean up on client disconnect
  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clearInterval(heartbeat);
    connections.delete(sendEvent);
  });

  // Error handling
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
    clearInterval(heartbeat);
    connections.delete(sendEvent);
  });
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  services().catch((err) => {
    console.error('Error in services:', err);
  });

  try {
    runId = await client.scheduleWorkflow({
      workflowName: 'handleReleaseWorkflow',
      workflowId: handleReleaseWorkflowId,
    });
  } catch (error) {
    console.error('Error in scheduleWorkflow:', error);
  }
});
