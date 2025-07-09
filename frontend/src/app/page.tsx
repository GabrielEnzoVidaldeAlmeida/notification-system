"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import Link from "next/link";
import { useSocket } from "@/contexts/SocketContext";

type Topic = {
  id: number;
  name: string;
  isSubscribed: boolean;
};

export default function HomePage() {
  useAuthRedirect();
  const { socket, notifications } = useSocket();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (notifications.length > 0) {
      console.log("Novas notificações:", notifications);
    }
  }, [notifications]);

  useEffect(() => {
    async function fetchTopicsWithStatus() {
      try {
        const topicsData = await authFetch<Omit<Topic, "isSubscribed">[]>(
          "http://localhost:5000/notifications/topics"
        );

        const topicsWithStatus: Topic[] = await Promise.all(
          topicsData.map(async (topic) => {
            try {
              const result = await authFetch<{ subscribed: boolean }>(
                `http://localhost:5000/notifications/topics/${topic.id}/subscription`
              );
              return { ...topic, isSubscribed: result.subscribed };
            } catch {
              return { ...topic, isSubscribed: false };
            }
          })
        );

        setTopics(topicsWithStatus);

        topicsWithStatus.forEach((topic) => {
          if (topic.isSubscribed) {
            socket?.emit("subscribe", { topic_id: topic.id });
          }
        });
      } catch (err) {
        console.error("Erro ao carregar tópicos:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchTopicsWithStatus();
  }, [socket]);

  async function toggleSubscription(topic: Topic) {
    const isSubscribing = !topic.isSubscribed;
    const url = `http://localhost:5000/notifications/topics/${topic.id}/${
      isSubscribing ? "subscribe" : "unsubscribe"
    }`;

    try {
      await authFetch(url, {
        method: "POST",
      });

      const newTopics = topics.map((t) =>
        t.id === topic.id ? { ...t, isSubscribed: isSubscribing } : t
      );
      setTopics(newTopics);

      if (isSubscribing) {
        socket?.emit("subscribe", { topic_id: topic.id });
        console.log("Emitiu subscribe para o tópico:", topic.id);
      } else {
        socket?.emit("unsubscribe", { topic_id: topic.id });
        console.log("Emitiu unsubscribe para o tópico:", topic.id);
      }
    } catch {
      alert("Erro ao alterar inscrição.");
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Tópicos Disponíveis</h1>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <ul className="space-y-3">
          {topics.map((topic) => (
            <li
              key={topic.id}
              className="flex items-center justify-between border p-3 rounded"
            >
              <span>{topic.name}</span>
              <button
                onClick={() => toggleSubscription(topic)}
                className={`px-3 py-1 hover:cursor-pointer rounded text-white ${
                  topic.isSubscribed
                    ? "bg-red-500 hover:bg-red-700"
                    : "bg-blue-500 hover:bg-blue-700"
                }`}
              >
                {topic.isSubscribed ? "Cancelar inscrição" : "Inscrever-se"}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-6 space-x-4">
        <Link href="/create-topic" className="underline text-blue-600">
          Criar novo tópico
        </Link>
        <Link href="/publish" className="underline text-blue-600">
          Publicar mensagem
        </Link>
        <Link href="/history" className="underline text-blue-600">
          Notificações
        </Link>
      </div>
    </main>
  );
}
