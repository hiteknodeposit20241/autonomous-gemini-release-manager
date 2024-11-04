This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Integration with Backend

This frontend application integrates with a backend Express server located at `@backend`. The UI allows users to:

- Get information on when a new commit event has been detected and whether a new release is needed or not.
- Create and publish releases.
- Client is connected via websockets to the backend.
