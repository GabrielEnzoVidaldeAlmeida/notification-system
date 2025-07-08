"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import Link from "next/link";

type Topic = {
  id: number;
  name: string;
};

export default function HomePage() {
  useAuthRedirect();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authFetch<Topic[]>("http://localhost:5000/notifications/topics")
      .then(setTopics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubscribe(topicId: number) {
    try {
      await authFetch(
        `http://localhost:5000/notifications/topics/${topicId}/subscribe`,
        { method: "POST" }
      );
      alert("Inscrito com sucesso!");
    } catch {
      alert("Erro ao se inscrever.");
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
                onClick={() => handleSubscribe(topic.id)}
                className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
              >
                Inscrever-se
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
