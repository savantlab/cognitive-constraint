"use client";

import { useState } from "react";
import styles from "./paper.module.css";

interface ValidateButtonProps {
  paperId: string;
  currentValidations: number;
}

export default function ValidateButton({ paperId, currentValidations }: ValidateButtonProps) {
  const [validations, setValidations] = useState(currentValidations);
  const [hasValidated, setHasValidated] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleValidate = async () => {
    if (hasValidated || loading) return;
    
    setLoading(true);
    
    try {
      const res = await fetch(`/api/papers/${paperId}/validate`, {
        method: "POST",
      });
      
      if (res.ok) {
        setValidations((v) => v + 1);
        setHasValidated(true);
      } else {
        const data = await res.json();
        alert(data.error || "Failed to validate");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.validateContainer}>
      <button
        onClick={handleValidate}
        disabled={hasValidated || loading}
        className={`${styles.validateButton} ${hasValidated ? styles.validated : ""}`}
      >
        {loading ? (
          "Validating..."
        ) : hasValidated ? (
          <>
            <span className={styles.checkIcon}>✓</span>
            Validated
          </>
        ) : (
          <>
            <span className={styles.checkIcon}>✓</span>
            Add Validation
          </>
        )}
      </button>
      <span className={styles.validationCount}>
        {validations} validation{validations !== 1 ? "s" : ""}
      </span>
    </div>
  );
}
