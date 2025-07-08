import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    router.push("/login");
    window.dispatchEvent(new Event("logout"));
  }

  return logout;
}
