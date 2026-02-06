import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Notified",
  description: "Subscribe to receive notifications when Cognitive Constraint Journal publishes new research in Psychology and Behavioral Science.",
};

export default function NotifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
