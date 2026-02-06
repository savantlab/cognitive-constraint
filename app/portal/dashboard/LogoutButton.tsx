"use client";

import { useRouter } from "next/navigation";
import styles from "../../dashboard/dashboard.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/portal/logout", { method: "POST" });
    router.push("/portal");
  };

  return (
    <button
      onClick={handleLogout}
      className={styles.backLink}
      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
    >
      Logout
    </button>
  );
}
