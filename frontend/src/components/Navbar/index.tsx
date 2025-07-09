"use client";

import { useLogout } from "@/hooks/useLogout";
import { useEffect, useState } from "react";
import NotificationsList from "../NotificationsList";
import Link from "next/link";

export function Navbar() {
  const logout = useLogout();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    function updateUsername() {
      setUsername(localStorage.getItem("username"));
    }

    updateUsername();

    window.addEventListener("login", updateUsername);
    window.addEventListener("logout", updateUsername);

    return () => {
      window.removeEventListener("login", updateUsername);
      window.removeEventListener("logout", updateUsername);
    };
  }, []);

  useEffect(() => {
    setUsername(localStorage.getItem("username"));

    function handleLogout() {
      setUsername(null);
    }

    window.addEventListener("logout", handleLogout);

    return () => {
      window.removeEventListener("logout", handleLogout);
    };
  }, []);

  return (
    <nav className="flex justify-between items-center w-full h-20 bg-black px-4">
      <div>
        <h1 className="text-white">{username ?? "Usuário"}</h1>
      </div>

      <div className="flex items-center gap-4 text-white">
        <NotificationsList />
        <Link href="/" className="hover:underline">
          Home
        </Link>
        <Link href="/history" className="hover:underline">
          Notificações
        </Link>
        {username && (
          <button
            className="hover:underline hover:cursor-pointer"
            onClick={logout}
          >
            Sair
          </button>
        )}
      </div>
    </nav>
  );
}
