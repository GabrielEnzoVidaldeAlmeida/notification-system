"use client";

import { useSocket } from "@/contexts/SocketContext";
import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";

type NotificationData = {
  message: string;
  topic: number;
};

type Topic = {
  id: number;
  name: string;
};

export default function NotificationsList() {
  const { notifications } = useSocket();
  const [visibleNotification, setVisibleNotification] =
    useState<NotificationData | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);

  useEffect(() => {
    async function fetchTopics() {
      try {
        const data = await authFetch<Topic[]>(
          "http://localhost:5000/notifications/topics"
        );
        setTopics(data);
      } catch (error) {
        console.error("Erro ao carregar tópicos:", error);
      }
    }
    fetchTopics();
  }, []);

  useEffect(() => {
    if (notifications.length > 0) {
      const lastNotification = notifications[notifications.length - 1];
      setVisibleNotification(lastNotification);

      const timer = setTimeout(() => {
        setVisibleNotification(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notifications]);

  function getTopicName(topicId: number): string {
    const topic = topics.find((t) => t.id === topicId);
    return topic ? topic.name : `Tópico ${topicId}`;
  }

  if (!visibleNotification) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 10,
        right: 10,
        width: 300,
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#333",
          color: "#fff",
          padding: "10px 15px",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        <strong>{getTopicName(visibleNotification.topic)}</strong>
        <p>{visibleNotification.message}</p>
      </div>
    </div>
  );
}
