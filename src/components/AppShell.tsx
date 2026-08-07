import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-[100dvh] bg-[var(--libido-bg)] text-[var(--libido-text)] flex flex-col md:max-w-md md:mx-auto md:border-x md:border-[var(--libido-border)] relative shadow-2xl overflow-hidden font-sans">
      {children}
    </div>
  );
}
