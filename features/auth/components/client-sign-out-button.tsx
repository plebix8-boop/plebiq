"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { createClient } from "@/utils/supabase/client";

type ClientSignOutButtonProps = {
  children: ReactNode;
  className?: string;
  title?: string;
};

export function ClientSignOutButton({
  children,
  className,
  title = "Sign out",
}: ClientSignOutButtonProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    if (isSigningOut) return;

    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button
      className={className}
      disabled={isSigningOut}
      onClick={handleSignOut}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}
