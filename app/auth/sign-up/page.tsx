import type { Metadata } from "next";
import { SignUpPage } from "@/features/auth/sign-up-page";

export const metadata: Metadata = {
  title: "Create an account",
  alternates: { canonical: null },
  robots: { index: false, follow: false },
};

export default function SignUpRoute() {
  return <SignUpPage />;
}
