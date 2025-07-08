"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

type Notification = {
  id: number;
  topic_name: string;
  message: string;
  created_at: string;
};

export default function HistoryPage() {
  useAuthRedirect();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setTokenReady(true);
    } else {
      setErrorMsg("Usuário não autenticado.");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tokenReady) return;

    authFetch<Notification[]>("http://localhost:5000/notifications/history")
      .then(setNotifications)
      .catch((err) => {
        console.error(err);
        setErrorMsg("Erro ao carregar notificações");
      })
      .finally(() => setLoading(false));
  }, [tokenReady]);

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Histórico de Notificações</h1>

      {loading && <p>Carregando notificações...</p>}

      {errorMsg && <p className="text-red-600 font-semibold">{errorMsg}</p>}

      {!loading && notifications.length === 0 && (
        <p>Nenhuma notificação recebida.</p>
      )}

      <ul className="space-y-4">
        {notifications.map(({ id, topic_name, message, created_at }) => (
          <li key={id} className="border p-3 rounded shadow-sm">
            <p className="font-semibold">{topic_name}</p>
            <p>{message}</p>
            <p className="text-sm text-gray-500">
              {new Date(created_at).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
