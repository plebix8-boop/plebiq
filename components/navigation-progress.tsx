"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

type BarState = "idle" | "running" | "done";

export function NavigationProgress() {
  const pathname = usePathname();
  const [barState, setBarState] = useState<BarState>("idle");
  const [width, setWidth] = useState(0);

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const isFirst = useRef(true);

  function clear() {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }

  function after(fn: () => void, ms: number) {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  }

  // Complete the bar whenever the pathname settles (navigation finished)
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }

    clear();
    setWidth(100);
    setBarState("done");

    after(() => {
      setBarState("idle");
      setWidth(0);
    }, 380);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Intercept every link click to start the bar immediately
  useEffect(() => {
    function onAnchorClick(e: MouseEvent) {
      const anchor = (e.target as Element).closest<HTMLAnchorElement>("a[href]");
      if (!anchor) return;
      if (anchor.target || anchor.download) return;

      let url: URL;
      try {
        url = new URL(anchor.href, location.href);
      } catch {
        return;
      }

      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;

      clear();
      setBarState("running");
      setWidth(0);

      // Stagger to ~82 % while waiting for the server
      requestAnimationFrame(() => {
        setWidth(28);
        after(() => setWidth(55), 280);
        after(() => setWidth(72), 800);
        after(() => setWidth(82), 2200);
      });
    }

    document.addEventListener("click", onAnchorClick);
    return () => {
      document.removeEventListener("click", onAnchorClick);
      clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (barState === "idle") return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[9999] h-[2px]"
      style={{
        width: `${width}%`,
        background:
          "linear-gradient(90deg, var(--accent-alt) 0%, var(--accent) 50%, var(--danger) 100%)",
        boxShadow: "0 0 10px var(--glow-accent), 0 0 3px var(--glow-accent)",
        transition:
          barState === "done"
            ? "width 0.28s ease-out"
            : "width 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      {/* Leading glow dot */}
      <div
        className="absolute right-0 top-1/2 size-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-fuchsia-300"
        style={{ boxShadow: "0 0 6px 2px var(--glow-accent)" }}
      />
    </div>
  );
}
