import { useEffect, useRef } from "react";
import io from "socket.io-client";

type NotificationData = {
  message: string;
  topic: number;
};

export function useSocket(onNotification: (data: NotificationData) => void) {
  const socketRef = useRef<ReturnType<typeof io> | null>(null);

  useEffect(() => {
    socketRef.current = io("http://localhost:5000", {
      transports: ["polling"],
      auth: {
        token: localStorage.getItem("token"),
      },
    });

    socketRef.current.on("connect", () => {
      console.log("Socket connected:", socketRef.current?.id);
    });

    socketRef.current.on("new_notification", (data: NotificationData) => {
      onNotification(data);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [onNotification]);

  return socketRef.current;
}
