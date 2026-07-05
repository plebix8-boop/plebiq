import { ResetPasswordPage } from "@/features/auth/reset-password-page";
import { createClient } from "@/utils/supabase/server";

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
