"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";

const subscribeToHydration = () => () => undefined;

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  return (
    <motion.div
      key={pathname}
      initial={isHydrated ? { opacity: 0, y: 7 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ isolation: "isolate" }}
    >
      {children}
    </motion.div>
  );
}
