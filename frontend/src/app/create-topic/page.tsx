"use client";

import { useState } from "react";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { authFetch } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateTopicPage() {
  useAuthRedirect();
  const router = useRouter();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      await authFetch("http://localhost:5000/notifications/topics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      alert("Tópico criado com sucesso!");
      router.push("/");
    } catch (err) {
      if (err instanceof Error) setErrorMsg(err.message);
      else setErrorMsg("Erro inesperado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Criar Novo Tópico</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium mb-1">
            Nome do tópico
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
            placeholder="ex: Eventos IFRN"
          />
        </div>

        {errorMsg && <p className="text-red-600 font-semibold">{errorMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Criando..." : "Criar tópico"}
        </button>
      </form>
    </main>
  );
}
