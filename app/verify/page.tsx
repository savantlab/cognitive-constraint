"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./verify.module.css";
import NatoCaptcha from "../components/NatoCaptcha";
import EulaModal from "../components/EulaModal";

export default function VerifyPage() {
  const router = useRouter();
  const [eulaAccepted, setEulaAccepted] = useState(false);

  const handleEulaAccept = () => {
    setEulaAccepted(true);
  };

  const handleSuccess = () => {
    // Set a session cookie (expires when browser closes)
    document.cookie = `paper_access=verified; path=/; SameSite=Lax`;
    document.cookie = `eula_accepted=true; path=/; SameSite=Lax`;
    router.push("/papers");
  };

  if (!eulaAccepted) {
    return <EulaModal onAccept={handleEulaAccept} />;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Access Papers</h1>
        <p className={styles.subtitle}>
          Quick verification to access our research.
        </p>
        <NatoCaptcha onSuccess={handleSuccess} />
      </div>
    </div>
  );
}
