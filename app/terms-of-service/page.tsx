import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service | Plebiq",
  description: "Terms of Service for Plebiq.",
};

const sections = [
  {
    title: "Using Plebiq",
    body: [
      "Plebiq is a social voting platform where people can participate in polls, view results, and share opinions. By using Plebiq, you agree to use the service lawfully and respectfully.",
      "You are responsible for the activity on your account and for keeping your login method secure.",
    ],
  },
  {
    title: "Accounts and sign-in",
    body: [
      "You may create or access an account using supported sign-in methods such as email, Google, or Facebook. We may refuse, suspend, or remove accounts that abuse the service or violate these terms.",
    ],
  },
  {
    title: "Polls and content",
    body: [
      "You may not use Plebiq to submit illegal, harmful, hateful, misleading, abusive, or spam content.",
      "Plebiq may moderate, remove, or restrict content and activity to protect users and maintain the quality of the service.",
    ],
  },
  {
    title: "Service availability",
    body: [
      "We work to keep Plebiq available and reliable, but the service is provided as is. We may change, pause, or discontinue parts of the service when needed.",
    ],
  },
  {
    title: "Limitation of liability",
    body: [
      "To the maximum extent allowed by law, Plebiq is not responsible for indirect, incidental, or consequential damages arising from use of the service.",
    ],
  },
  {
    title: "Changes to these terms",
    body: [
      "We may update these terms from time to time. Continued use of Plebiq after updates means you accept the revised terms.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For questions about these terms, contact Plebiq through the in-app feedback option or email support@plebiq.com.",
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <LegalPage
      title="Terms of Service"
      description="These terms explain the basic rules for using Plebiq."
      updated="July 7, 2026"
      sections={sections}
    />
  );
}
