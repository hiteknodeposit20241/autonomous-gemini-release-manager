"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

import { useWebSocket } from "./utils/useWebsocket";

export default function Home() {
  const { isConnected, events, sendMessage } = useWebSocket(
    "ws://localhost:8000/events"
  );

  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    if (isConnected) {
      sendMessage({ type: "greeting" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen font-[family-name:var(--font-geist-sans)] bg-white dark:bg-gray-900 text-black dark:text-white">
      <main className="flex flex-col gap-8 items-center w-full max-w-2xl px-4">
        <h1 className="text-2xl font-bold mb-4">Github release manager</h1>

        {/* Chat messages container */}
        <div className="w-full h-[500px] border rounded-lg overflow-y-auto p-4 bg-gray-50 dark:bg-gray-800">
          {events.map((event, index) => (
            <div
              key={index}
              className={`flex ${
                event.type === "assistant-message"
                  ? "justify-start"
                  : "justify-end"
              } mb-4`}
            >
              <div
                className={`max-w-[70%] p-3 rounded-lg ${
                  event.type === "assistant-message"
                    ? "bg-gray-200 dark:bg-gray-700"
                    : "bg-blue-500 text-white"
                } prose dark:prose-invert prose-sm`}
              >
                <ReactMarkdown>{event.data}</ReactMarkdown>
              </div>
            </div>
          ))}
        </div>

        {/* Chat input */}
        <div className="w-full flex gap-2">
          <input
            type="text"
            placeholder="Type your message..."
            className="flex-1 border rounded-lg p-2 bg-white dark:bg-gray-800 text-black dark:text-white"
            value={userMessage}
            onChange={(e) => setUserMessage(e.target.value)}
          />
          <button
            type="button"
            className="bg-blue-500 text-white rounded-lg px-4 py-2"
            onClick={() => {
              if (userMessage) {
                sendMessage({ type: "create-release", data: userMessage });
                setUserMessage("");
              }
            }}
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}
