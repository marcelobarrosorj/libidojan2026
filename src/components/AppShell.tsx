import { ReactNode } from "react";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-full min-h-screen bg-[var(--libido-bg)] text-[var(--libido-text)] flex flex-col relative overflow-hidden font-sans">
      {children}
    </div>
  );
}