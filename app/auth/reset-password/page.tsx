import type { Metadata } from "next";
import { ResetPasswordPage } from "@/features/auth/reset-password-page";
import { createClient } from "@/utils/supabase/server";

export const metadata: Metadata = {
  title: "Reset password",
  robots: { index: false, follow: false },
};

export default async function ResetPasswordRoute() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <ResetPasswordPage
      email={user?.email}
      isRecoverySession={Boolean(user?.email)}
    />
  );
}
