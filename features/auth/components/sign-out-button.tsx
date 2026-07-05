import { signOut } from "@/features/auth/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-black transition hover:border-border-strong hover:bg-surface-soft"
      >
        Sign out
      </button>
    </form>
  );
}
