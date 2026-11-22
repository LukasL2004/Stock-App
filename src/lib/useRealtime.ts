import { useEffect, useRef } from "react";
import SockJS from "sockjs-client";
import Stomp from "stompjs";
import { getEmail } from "./auth";
import { MOCK_MODE, WS_URL } from "./http";

/**
 * Subscribes to the per-user STOMP topic and calls `onMessage` whenever the
 * backend announces a wallet or portfolio change. One connection per caller;
 * reconnects with backoff if the socket drops.
 */
export function useRealtime(onMessage: () => void) {
  const cb = useRef(onMessage);
  cb.current = onMessage;

  useEffect(() => {
    const email = getEmail();
    if (!email || MOCK_MODE) return;

    let client: Stomp.Client | null = null;
    let timer: number | undefined;
    let attempt = 0;
    let disposed = false;

    const connect = () => {
      if (disposed) return;
      const socket = new SockJS(WS_URL);
      client = Stomp.over(socket);
      client.debug = () => {};
      client.connect(
        {},
        () => {
          attempt = 0;
          client?.subscribe(`/topic/${email}`, () => cb.current());
        },
        () => {
          if (disposed) return;
          const delay = Math.min(30_000, 1000 * 2 ** attempt++);
          timer = window.setTimeout(connect, delay);
        },
      );
    };

    connect();

    return () => {
      disposed = true;
      if (timer) window.clearTimeout(timer);
      if (client?.connected) client.disconnect(() => {});
    };
  }, []);
}
