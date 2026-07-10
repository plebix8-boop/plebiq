"use client";

import Image from "next/image";
import { useTheme } from "@/contexts/theme-context";

type ThemeLogoProps = {
  alt?: string;
  className?: string;
  height: number;
  priority?: boolean;
  width: number;
};

export function ThemeLogo({
  alt = "Plebiq",
  className,
  height,
  priority = false,
  width,
}: ThemeLogoProps) {
  const { effectiveTheme } = useTheme();

  return (
    <Image
      alt={alt}
      className={className}
      height={height}
      priority={priority}
      src={effectiveTheme === "dark" ? "/logo-dark.png" : "/logo.png"}
      width={width}
    />
  );
}
