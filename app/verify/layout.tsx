import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verify Access",
  description: "Verify your access to Cognitive Constraint Journal papers.",
};

export default function VerifyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
