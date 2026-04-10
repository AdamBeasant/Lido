"use client";

import { motion } from "framer-motion";

interface ProgressBarProps {
  checked: number;
  total: number;
  label?: string;
}

export function ProgressBar({ checked, total, label }: ProgressBarProps) {
  const percentage = total > 0 ? (checked / total) * 100 : 0;
  const isComplete = checked === total && total > 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${isComplete ? "bg-emerald-500" : "bg-blue-500"}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </div>
      <span className={`text-xs font-medium tabular-nums ${isComplete ? "text-emerald-500" : "text-neutral-400"}`}>
        {checked}/{total} {label}
      </span>
    </div>
  );
}
