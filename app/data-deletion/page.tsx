import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Data Deletion",
  description: "Data deletion instructions for Plebiq.",
  alternates: { canonical: "/data-deletion" },
  openGraph: { type: "article", url: "https://plebiq.com/data-deletion", title: "Data Deletion | Plebiq", description: "Data deletion instructions for Plebiq.", images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "Plebiq - the world votes here" }] },
  twitter: { card: "summary_large_image", title: "Data Deletion | Plebiq", description: "Data deletion instructions for Plebiq.", images: ["/opengraph-image"] },
};

const sections = [
  {
    title: "How to request deletion",
    body: [
      "You can request deletion of your Plebiq account and associated personal data by emailing support@plebiq.com from the email address connected to your account.",
      "Include the subject line \"Delete my Plebiq account\" and, if possible, mention whether you signed in with email, Google, or Facebook.",
    ],
  },
  {
    title: "What we delete",
    body: [
      "After verifying the request, we delete or anonymize account profile information, authentication-linked personal details stored by Plebiq, feedback messages, and other personal data that identifies your account.",
      "Some aggregate poll counts or anonymized voting statistics may remain because they are no longer tied to your identity and help preserve poll results.",
    ],
  },
  {
    title: "Processing time",
    body: [
      "We aim to complete deletion requests within 30 days. If we need more information to verify the request, we may contact you before processing it.",
    ],
  },
  {
    title: "Facebook data deletion callback",
    body: [
      "If you connected to Plebiq using Facebook Login and want your Facebook-related data removed, follow the same deletion request process above.",
      "Once processed, Plebiq will remove or anonymize the Facebook-linked account information stored in our systems.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For questions about deletion status, email support@plebiq.com or contact us through the in-app feedback option.",
    ],
  },
];

export default function DataDeletionPage() {
  return (
    <LegalPage
      title="Data Deletion"
      description="Use this page to understand how to request removal of your Plebiq account data."
      updated="July 7, 2026"
      sections={sections}
    />
  );
}
