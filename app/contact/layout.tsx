import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Cognitive Constraint Journal for licensing inquiries, subscription questions, paper submissions, or general feedback.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
