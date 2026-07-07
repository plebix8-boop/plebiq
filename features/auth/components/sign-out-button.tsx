import { signOut } from "@/features/auth/actions";
import { AppButton } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <AppButton
        type="submit"
        variant="secondary"
      >
        Sign out
      </AppButton>
    </form>
  );
}
