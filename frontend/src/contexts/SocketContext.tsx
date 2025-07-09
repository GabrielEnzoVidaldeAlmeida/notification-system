"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import io from "socket.io-client";

type NotificationData = {
  message: string;
  topic: number;
};

type SocketContextType = {
  socket: ReturnType<typeof io> | null;
  notifications: NotificationData[];
};

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");

    const newSocket = io("http://localhost:5000", {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket conectado:", newSocket.id);
    });

    newSocket.on("new_notification", (data: NotificationData) => {
      setNotifications((prev) => [...prev, data]);
    });

    return () => {
      newSocket.disconnect();
      setSocket(null);
      setNotifications([]);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, notifications }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket deve ser usado dentro de SocketProvider");
  }
  return context;
}
