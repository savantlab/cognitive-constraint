"use client";

import { useState, useEffect } from "react";
import styles from "./CookieConsent.module.css";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("ccj_cookie_consent");
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("ccj_cookie_consent", "accepted");
    setVisible(false);
  };

  const decline = () => {
    localStorage.setItem("ccj_cookie_consent", "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.content}>
        <p className={styles.text}>
          We use cookies for authentication and to improve your experience. 
          No tracking or advertising cookies are used.
        </p>
        <div className={styles.buttons}>
          <button onClick={decline} className={styles.declineButton}>
            Decline
          </button>
          <button onClick={accept} className={styles.acceptButton}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
