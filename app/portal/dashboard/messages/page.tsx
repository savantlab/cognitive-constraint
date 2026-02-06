"use client";

import { useState, useEffect } from "react";
import styles from "../../../dashboard/dashboard.module.css";

interface Message {
  id: string;
  content: string;
  sender_type: string;
  is_read: boolean;
  created_at: string;
}

interface Thread {
  id: string;
  subject: string;
  status: string;
  paper: { id: string; title: string };
  author?: { id: string; name: string; email: string };
  reviewer?: { id: string; name: string; email: string };
  messages: Message[];
  updated_at: string;
}

export default function MessagesPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchThreads();
  }, []);

  const fetchThreads = async () => {
    try {
      const res = await fetch("/api/portal/messages");
      const data = await res.json();
      setThreads(data.threads || []);
    } catch (err) {
      console.error("Error fetching threads:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !newMessage.trim()) return;

    setSending(true);
    try {
      const res = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: selectedThread.id,
          content: newMessage,
        }),
      });

      if (res.ok) {
        setNewMessage("");
        // Refetch and update selected thread
        const threadsRes = await fetch("/api/portal/messages");
        const data = await threadsRes.json();
        const updatedThreads = data.threads || [];
        setThreads(updatedThreads);
        const updated = updatedThreads.find((t: Thread) => t.id === selectedThread.id);
        if (updated) setSelectedThread(updated);
      }
    } catch (err) {
      console.error("Error sending message:", err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <div className={styles.main}>Loading...</div>;
  }

  return (
    <div>
      <div className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Messages</h1>
        <p className={styles.pageDescription}>
          Communication with editors and authors about your papers.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: "1.5rem", minHeight: "500px" }}>
        {/* Thread List */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid var(--border)",
              fontWeight: 600,
            }}
          >
            Conversations
          </div>

          {threads.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}>
              No messages yet
            </div>
          ) : (
            <div>
              {threads.map((thread) => {
                const unreadCount = thread.messages?.filter((m) => !m.is_read).length || 0;
                const lastMessage = thread.messages?.[thread.messages.length - 1];
                const otherParty = thread.author || thread.reviewer;

                return (
                  <button
                    key={thread.id}
                    onClick={() => setSelectedThread(thread)}
                    style={{
                      display: "block",
                      width: "100%",
                      padding: "1rem",
                      borderBottom: "1px solid var(--border)",
                      background: selectedThread?.id === thread.id ? "var(--background)" : "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      border: "none",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ fontWeight: 500, marginBottom: "0.25rem" }}>
                        {thread.paper?.title || "Untitled"}
                      </div>
                      {unreadCount > 0 && (
                        <span
                          style={{
                            background: "#3b82f6",
                            color: "white",
                            borderRadius: "10px",
                            padding: "0.125rem 0.5rem",
                            fontSize: "0.75rem",
                          }}
                        >
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                      {otherParty?.name || otherParty?.email || "Unknown"}
                    </div>
                    {lastMessage && (
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "var(--muted)",
                          marginTop: "0.5rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {lastMessage.content.slice(0, 50)}
                        {lastMessage.content.length > 50 ? "..." : ""}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Message View */}
        <div
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "8px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {selectedThread ? (
            <>
              {/* Header */}
              <div
                style={{
                  padding: "1rem",
                  borderBottom: "1px solid var(--border)",
                }}
              >
                <div style={{ fontWeight: 600 }}>{selectedThread.paper?.title}</div>
                <div style={{ fontSize: "0.85rem", color: "var(--muted)" }}>
                  {selectedThread.author?.name || selectedThread.reviewer?.name}
                </div>
              </div>

              {/* Messages */}
              <div
                style={{
                  flex: 1,
                  padding: "1rem",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {selectedThread.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.sender_type === "reviewer" ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                    }}
                  >
                    <div
                      style={{
                        padding: "0.75rem 1rem",
                        background: msg.sender_type === "reviewer" ? "#3b82f6" : "var(--background)",
                        color: msg.sender_type === "reviewer" ? "white" : "var(--foreground)",
                        borderRadius: "12px",
                        borderBottomRightRadius: msg.sender_type === "reviewer" ? "4px" : "12px",
                        borderBottomLeftRadius: msg.sender_type === "author" ? "4px" : "12px",
                      }}
                    >
                      {msg.content}
                    </div>
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "var(--muted)",
                        marginTop: "0.25rem",
                        textAlign: msg.sender_type === "reviewer" ? "right" : "left",
                      }}
                    >
                      {new Date(msg.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>

              {/* Input */}
              <form
                onSubmit={handleSendMessage}
                style={{
                  padding: "1rem",
                  borderTop: "1px solid var(--border)",
                  display: "flex",
                  gap: "0.75rem",
                }}
              >
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className={styles.input}
                  placeholder="Type a message..."
                  style={{ flex: 1 }}
                  disabled={sending}
                />
                <button
                  type="submit"
                  className={styles.primaryButton}
                  disabled={sending || !newMessage.trim()}
                >
                  {sending ? "..." : "Send"}
                </button>
              </form>
            </>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                color: "var(--muted)",
              }}
            >
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
