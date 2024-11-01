import { useEffect, useRef, useState, useCallback } from "react";

export const useWebSocket = (url: string) => {
  const [isConnected, setIsConnected] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [events, setEvents] = useState<any[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log(data, "data");
      setEvents((prev) => [...prev, data]);
    };

    ws.onclose = () => {
      console.log("Disconnected from WebSocket");
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, [url]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  return {
    isConnected,
    events,
    sendMessage,
  };
};
