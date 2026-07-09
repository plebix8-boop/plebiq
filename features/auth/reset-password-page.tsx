import Link from "next/link";
import { AuthSplitLayout } from "./components/auth-split-layout";
import { PasswordResetRequestForm } from "./components/password-reset-request-form";
import { PasswordUpdateForm } from "./components/password-update-form";

type ResetPasswordPageProps = {
  email?: string;
  isRecoverySession: boolean;
};

export function ResetPasswordPage({
  email,
  isRecoverySession,
}: ResetPasswordPageProps) {
  return (
    <AuthSplitLayout
      formEyebrow={isRecoverySession ? "Choose a new password" : "Forgot password"}
      formTitle={isRecoverySession ? "Set your new password" : "Reset your password"}
      formDescription={
        isRecoverySession
          ? "Your reset link is confirmed. Choose a new password to finish signing in."
          : "Enter your email and we’ll send you a secure reset link."
      }
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            Remembered your password?{" "}
            <Link
              href="/auth"
              className="font-semibold text-accent transition hover:text-black"
            >
              Sign in
            </Link>
          </p>
          <p>
            Need an account?{" "}
            <Link
              href="/auth/sign-up"
              className="font-semibold text-accent transition hover:text-black"
            >
              Create account
            </Link>
          </p>
        </div>
      }
    >
      {isRecoverySession ? (
        <PasswordUpdateForm email={email} />
      ) : (
        <PasswordResetRequestForm />
      )}
    </AuthSplitLayout>
  );
}
