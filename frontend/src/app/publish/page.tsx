"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useRouter } from "next/navigation";

type Topic = {
  id: number;
  name: string;
};

export default function PublishPage() {
  useAuthRedirect();
  const router = useRouter();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    authFetch<Topic[]>("http://localhost:5000/notifications/topics")
      .then((data) => {
        setTopics(data);
        if (data.length > 0) setSelectedTopicId(data[0].id);
      })
      .catch(() => setErrorMsg("Erro ao carregar tópicos"));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedTopicId) {
      setErrorMsg("Selecione um tópico");
      return;
    }
    setLoading(true);
    setErrorMsg("");

    try {
      await authFetch(
        `http://localhost:5000/notifications/topics/${selectedTopicId}/publish`,
        {
          method: "POST",
          body: JSON.stringify({ message }),
          headers: { "Content-Type": "application/json" },
        }
      );

      alert("Mensagem publicada com sucesso!");
      setMessage("");
      router.push("/history");
    } catch {
      setErrorMsg("Erro ao publicar mensagem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Publicar Mensagem</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="topic" className="block font-medium mb-1">
            Tópico
          </label>
          <select
            id="topic"
            value={selectedTopicId ?? ""}
            onChange={(e) => setSelectedTopicId(Number(e.target.value))}
            className="w-full border px-3 py-2 rounded"
          >
            {topics.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="message" className="block font-medium mb-1">
            Mensagem
          </label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            rows={4}
            placeholder="Digite sua mensagem aqui..."
          />
        </div>

        {errorMsg && <p className="text-red-600 font-semibold">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Publicando..." : "Publicar"}
        </button>
      </form>
    </main>
  );
}
