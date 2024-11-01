"use client";

import React, { useEffect } from "react";
import { useWebSocket } from "./utils/useWebsocket";

export default function Home() {
  const { isConnected, events, sendMessage } = useWebSocket(
    "ws://localhost:8000/events"
  );

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: "greeting" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  console.log(events, "events");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-[family-name:var(--font-geist-sans)] bg-white dark:bg-gray-900 text-black dark:text-white">
      <main className="flex flex-col gap-8 items-center sm:items-start">
        <h1 className="text-2xl font-bold mb-4">Github release manager</h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <textarea
              placeholder="GitHub Repository URL"
              className="border rounded p-2 w-full bg-white dark:bg-gray-800 text-black dark:text-white"
              name="repoUrl"
            />
          </div>
        </div>
        <button
          type="button"
          className="bg-green-500 text-white rounded p-2 mt-2"
          onClick={() => {
            sendMessage({ type: "client-message", data: "Hello Servers!" });
          }}
        >
          Get Releases
        </button>
      </main>
    </div>
  );
}
