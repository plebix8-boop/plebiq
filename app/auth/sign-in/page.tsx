import type { Metadata } from "next";
import { SignInPage } from "@/features/auth/sign-in-page";

export const metadata: Metadata = {
  title: "Sign in",
  alternates: { canonical: null },
  robots: { index: false, follow: false },
};

export default function SignInRoute() {
  return <SignInPage />;
}
