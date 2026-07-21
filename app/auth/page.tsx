import type { Metadata } from "next";
import { SignInPage } from "@/features/auth/sign-in-page";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default function AuthRoute() {
  return <SignInPage />;
}
