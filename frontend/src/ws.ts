import { useEffect, useRef } from "react";
import { WS_URL } from "./api";
import type { WsMessage } from "./types";

export function useLiveStream(
  onMessage: (message: WsMessage) => void,
  onStatusChange?: (connected: boolean) => void
) {
  const handlerRef = useRef(onMessage);
  handlerRef.current = onMessage;
  const statusRef = useRef(onStatusChange);
  statusRef.current = onStatusChange;

  useEffect(() => {
    let socket: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let closedByClient = false;

    function connect() {
      socket = new WebSocket(`${WS_URL}/ws/events`);

      socket.onopen = () => statusRef.current?.(true);

      socket.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data) as WsMessage;
          handlerRef.current(parsed);
        } catch {
          // ignore malformed frames
        }
      };

      socket.onclose = () => {
        statusRef.current?.(false);
        if (!closedByClient) {
          retryTimer = setTimeout(connect, 2000);
        }
      };

      socket.onerror = () => {
        socket?.close();
      };
    }

    connect();

    return () => {
      closedByClient = true;
      if (retryTimer) clearTimeout(retryTimer);
      socket?.close();
    };
  }, []);
}