import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy | Plebiq",
  description: "Privacy Policy for Plebiq.",
};

const sections = [
  {
    title: "Information we collect",
    body: [
      "Plebiq collects the information needed to create and secure your account, such as your name, email address, login provider, country, and basic profile details provided by Google or other supported sign-in providers.",
      "We also collect app activity such as votes, poll interactions, feedback messages, and technical information like device, browser, IP-derived location, and security logs.",
    ],
  },
  {
    title: "How we use information",
    body: [
      "We use your information to provide the voting experience, authenticate your account, prevent abuse, show poll results, improve the service, and respond to support or feedback requests.",
      "We do not sell your personal information.",
    ],
  },
  {
    title: "Third-party services",
    body: [
      "Plebiq uses third-party services for authentication, hosting, analytics, and infrastructure. These services may process information only as needed to provide their services to Plebiq.",
      "If you sign in with Google or Facebook, those providers may share basic account information with us, such as your verified email and public profile details.",
    ],
  },
  {
    title: "Cookies and sessions",
    body: [
      "We use cookies and similar technologies to keep you signed in, protect your session, remember preferences, and measure basic app performance.",
    ],
  },
  {
    title: "Data retention",
    body: [
      "We keep account and voting information for as long as needed to operate Plebiq, comply with legal obligations, resolve disputes, and protect the service.",
      "You can request deletion of your account data using the instructions on our Data Deletion page.",
    ],
  },
  {
    title: "Contact",
    body: [
      "For privacy questions or account data requests, contact Plebiq through the in-app feedback option or email support@plebiq.com.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      description="This policy explains what information Plebiq collects, how we use it, and how you can request changes or deletion."
      updated="July 7, 2026"
      sections={sections}
    />
  );
}
