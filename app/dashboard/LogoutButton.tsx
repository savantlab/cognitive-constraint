"use client";

import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/dashboard/login");
  };

  return (
    <button onClick={handleLogout} className={styles.backLink} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
      Logout
    </button>
  );
}
