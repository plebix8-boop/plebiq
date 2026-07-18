"use client";

import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

function subscribeToVisibility(callback: () => void) {
  document.addEventListener("visibilitychange", callback);
  return () => document.removeEventListener("visibilitychange", callback);
}

function getVisibilitySnapshot() {
  return document.visibilityState === "visible";
}

export function usePageVisible() {
  return useSyncExternalStore(subscribeToVisibility, getVisibilitySnapshot, () => true);
}

export function useMediaQuery(query: string) {
  const subscribe = useCallback(
    (callback: () => void) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    [query],
  );

  const getSnapshot = useCallback(() => window.matchMedia(query).matches, [query]);
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function useElementInView<T extends Element>(rootMargin = "200px") {
  const [element, setElement] = useState<T | null>(null);
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    if (!element) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { rootMargin },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, [element, rootMargin]);

  return { isInView, ref: setElement };
}
