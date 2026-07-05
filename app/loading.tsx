export default function Loading() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-app-bg">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-purple-700/20 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[440px] w-[440px] rounded-full bg-blue-700/15 blur-[120px]" />

      <div className="relative flex flex-col items-center gap-6">
        {/* Spinning ring */}
        <div className="relative size-14">
          <div className="absolute inset-0 rounded-full border-2 border-white/8" />
          <div
            className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-400"
            style={{ animation: "spin 0.9s linear infinite" }}
          />
          <div
            className="absolute inset-[5px] rounded-full border border-transparent border-t-fuchsia-400/60"
            style={{ animation: "spin 1.3s linear infinite reverse" }}
          />
        </div>

        <div className="flex flex-col items-center gap-1.5">
          <p className="text-sm font-semibold text-white/40">
            Loading polls…
          </p>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="size-1.5 rounded-full bg-white/20"
                style={{
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse {
          0%, 100% { opacity: 0.2; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
