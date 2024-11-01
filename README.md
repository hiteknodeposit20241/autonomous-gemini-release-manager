## Overview

This repository showcases how to use the Restack AI SDK to call workflows and send events. The backend is implemented using a simple Express server, and the frontend is a Next.js application.

Communication with the gemini agent will be done via websockets. Once a commit is detected from the repository that is configured with the webhook, the assistant will ask the human if they want to create a released based on the commits that will be part of it.
