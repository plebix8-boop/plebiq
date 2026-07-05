import Link from "next/link";
import { AuthSplitLayout } from "./components/auth-split-layout";
import { SocialLoginButtons } from "./components/social-login-buttons";
import { SignUpForm } from "./components/sign-up-form";

export function SignUpPage() {
  return (
    <AuthSplitLayout
      formEyebrow="New to Plebiq"
      formTitle="Create your account"
      formDescription="Sign up with email and password, or begin with a social login option."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <Link
              href="/auth/reset-password"
              className="font-medium text-accent transition hover:text-black"
            >
              Reset password
            </Link>
          </p>
          <p>
            Already have an account?{" "}
            <Link
              href="/auth/sign-in"
              className="font-semibold text-accent transition hover:text-black"
            >
              Sign in
            </Link>
          </p>
        </div>
      }
    >
      <SocialLoginButtons mode="sign-up" />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
          or create with email
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <SignUpForm />
    </AuthSplitLayout>
  );
}
