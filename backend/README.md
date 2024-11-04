# Create repository releases

This folder contains an Express server implemented in TypeScript that showcases the usage of the Restack AI SDK with GitHub integration.

## Overview

The backend server is designed to create releases on a provided GitHub repository using the Restack AI SDK. It provides an API endpoint that accepts the necessary data to create a release: tagname, repository url, release name and release description.

Once the express server is booted the workflow `handleReleaseWorkflow` will be started as well. It will keep running and listening to events to either create or publish a release on github. This is to showcase how workflows can keep running for an indefinite time and as well how to define, handle and send events using the restack ai sdk.

## Features

- Express server setup with TypeScript and Websockets
- GitHub integration for creating releases
- Google vertex ai and gemini for AI interactions
- Environment variable configuration for secure token management
- A long running workflow that will listen to events: new commit, greeting, create release events.

## Github webhook setup

You will need to tunnel your localhost instant, either using ngrok or smee. We recommend using [smee](https://smee.io/). You can follow instructions on their website. Once you have your smee channel id, update the "tunnel" script on the package.json to point to your channel.

You will then set the same smee url as the webhook on your github repository. This can be found in the webhooks section on your github repository settings. Then you can just make a push to your main branch while you have your local instance running and tunneled through smee to get the webhook event.

## Setup

1. Install dependencies:

   ```
   npm install
   ```

2. Install smee-client for tunneling webhooks

   ```
   npm install -g smee-client
   ```

3. Set up environment variables:
   Create a `.env` file in the root of the backend folder and add your GitHub authentication token:

   ```
   GITHUB_AUTH_TOKEN=your_github_token_here
   GEMINI_API_KEY=your_gemini_key_here
   GOOGLE_CLOUD_PROJECT_ID=your_google_cloud_project_id
   GOOGLE_CLOUD_LOCATION=your_google_cloud_location
   ```

4. Build the TypeScript code:

   ```
   npm run build
   ```

5. Start Restack AI:

   ```
   docker run -d --pull always --name studio -p 5233:5233 -p 6233:6233 -p 7233:7233 ghcr.io/restackio/engine:main
   ```

6. Start the server:
   ```
   npm run start:server
   ```
7. Tunnel your localhost to the internet
   ```
   npm run tunnel
   ```

## API Endpoints

### WebSocket Endpoint `/events`

Establishes a WebSocket connection for real-time communication.

- **Connection:**

  ```
  ws://localhost:8000/events
  ```

- **Client Messages:**

  1. Greeting Message:
     ```json
     {
       "type": "greeting"
     }
     ```
  2. Create Release Message:
     ```json
     {
       "type": "create-release",
       "data": "user message here"
     }
     ```

- **Server Messages:**

  ```json
  {
    "type": "assistant-message",
    "data": "AI assistant response"
  }
  ```

- **Features:**
  - Automatic ping every 30 seconds to keep connection alive
  - Error handling and cleanup on disconnect
  - Broadcast support for multiple clients

### `POST /webhook`

- **Request body:**
  ```json
  {
    "repository": {
      "full_name": "username/repo",
      "default_branch": "main"
    },
    "ref": "refs/heads/branch"
  }
  ```
- **Response:** A message confirming the webhook was received.

## Docker Support

A Dockerfile is provided for containerization.
