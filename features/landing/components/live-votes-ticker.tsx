import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { liveVoteUsers } from "../data";

type VoteToast = {
  id: number;
  name: string;
  code: string;
};

export function LiveVotesTicker() {
  const [items, setItems] = useState<VoteToast[]>([]);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const removeTimers: number[] = [];

    const playTick = () => {
      try {
        const AudioContextClass =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;
        if (!AudioContextClass) {
          return;
        }

        const context = new AudioContextClass();
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "triangle";
        oscillator.frequency.value = 1000;
        gain.gain.value = 0.015;

        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start();

        window.setTimeout(() => {
          oscillator.stop();
          context.close();
        }, 40);
      } catch {
        // Audio can be blocked until the first user interaction.
      }
    };

    const getNextDelay = () => {
      const isFastBurst = Math.random() < 0.2;
      return isFastBurst
        ? 3000 + Math.random() * 4000
        : 8000 + Math.random() * 52000;
    };

    const addItem = () => {
      const randomUser =
        liveVoteUsers[Math.floor(Math.random() * liveVoteUsers.length)];
      const newItem = {
        id: Date.now() + Math.random(),
        name: randomUser.name,
        code: randomUser.code,
      };

      setItems((previousItems) => [newItem, ...previousItems].slice(0, 4));
      playTick();

      const removeTimer = window.setTimeout(() => {
        setItems((previousItems) =>
          previousItems.filter((item) => item.id !== newItem.id),
        );
      }, 5000);

      removeTimers.push(removeTimer);
      timeoutRef.current = window.setTimeout(addItem, getNextDelay());
    };

    timeoutRef.current = window.setTimeout(addItem, 4000);

    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      removeTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <div className="pointer-events-none absolute right-4 top-20 z-30 hidden max-w-[min(22rem,calc(100vw-2rem))] flex-col items-end gap-3 sm:flex lg:right-8">
      {items.map((user, index) => (
        <motion.div
          animate={{ opacity: 1, x: 0, scale: 1 }}
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-poll-badge-border bg-poll-badge-bg px-4 py-2 text-sm text-poll-badge-text shadow-[0_8px_30px_var(--shadow-soft)] backdrop-blur-md"
          exit={{ opacity: 0, x: 100 }}
          initial={{ opacity: 0, x: 100, scale: 0.95 }}
          key={user.id}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 22,
            delay: index * 0.05,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            className="h-4 w-6 object-contain"
            src={`https://flagcdn.com/${user.code}.svg`}
          />
          <span className="font-semibold">{user.name}</span>
          <span className="text-poll-card-muted">just voted</span>
        </motion.div>
      ))}
    </div>
  );
}
