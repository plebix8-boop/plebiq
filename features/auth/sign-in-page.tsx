import Link from "next/link";
import { AuthSplitLayout } from "./components/auth-split-layout";
import { SignInForm } from "./components/sign-in-form";
import { SocialLoginButtons } from "./components/social-login-buttons";

export function SignInPage() {
  return (
    <AuthSplitLayout
      formEyebrow="Welcome back"
      formTitle="Sign in to your account"
      formDescription="Use your email and password, or choose a social login provider below."
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <Link
              href="/auth/reset-password"
              className="font-medium text-accent transition hover:text-black"
            >
              Forgot password?
            </Link>
          </p>
          <p>
            New here?{" "}
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
      <SocialLoginButtons mode="sign-in" />

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium uppercase tracking-[0.25em] text-slate-400">
          or use email
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      <SignInForm />
    </AuthSplitLayout>
  );
}
