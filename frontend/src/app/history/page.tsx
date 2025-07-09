"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/api";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";
import { useSocket } from "@/hooks/useSocket";

type Notification = {
  id: number;
  topic: string; // nome do tópico
  message: string;
  timestamp: string; // ISO string
};

export default function HistoryPage() {
  useAuthRedirect();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Função para carregar histórico do backend
  async function loadNotifications() {
    try {
      setLoading(true);
      const data = await authFetch<Notification[]>(
        "http://localhost:5000/notifications/history"
      );
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setErrorMsg("Erro ao carregar notificações");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNotifications();
  }, []);

  // Callback para lidar com notificações novas do socket
  const handleNewNotification = useCallback(
    (data: { message: string; topic: string | number }) => {
      alert(`Nova notificação no tópico ${data.topic}: ${data.message}`);

      // Adiciona a notificação nova no topo da lista
      setNotifications((prev) => [
        {
          id: Date.now(), // id temporário
          topic: String(data.topic),
          message: data.message,
          timestamp: new Date().toISOString(),
        },
        ...prev,
      ]);
    },
    []
  );

  // Hook que gerencia o socket e registra o listener
  useSocket(handleNewNotification);

  return (
    <main className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Histórico de Notificações</h1>

      {loading && <p>Carregando notificações...</p>}

      {errorMsg && <p className="text-red-600 font-semibold">{errorMsg}</p>}

      {!loading && notifications.length === 0 && <p>Nenhuma notificação.</p>}

      <ul className="space-y-4">
        {notifications.map(({ id, topic, message, timestamp }) => (
          <li key={id} className="border p-3 rounded shadow-sm">
            <p className="font-semibold">{topic}</p>
            <p>{message}</p>
            <p className="text-sm text-gray-500">
              {new Date(timestamp).toLocaleString()}
            </p>
          </li>
        ))}
      </ul>
    </main>
  );
}
