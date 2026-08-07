import { motion } from 'motion/react';

export function SonarRing({ delay, size }: { delay: number; size: string }) {
  return (
    <div className={`absolute ${size} rounded-full border border-emerald-900/30 flex items-center justify-center z-0 pointer-events-none`}>
      <motion.div 
        className="absolute inset-0 rounded-full border-[1px] border-emerald-500/20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: [1, 1.05, 1], opacity: [0.1, 0.4, 0.1] }}
        transition={{ duration: 4, delay, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
