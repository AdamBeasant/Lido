"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChecklistItem as ChecklistItemType } from "@/types/database";

interface ChecklistItemProps {
  item: ChecklistItemType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export function ChecklistItemComponent({ item, onToggle, onDelete }: ChecklistItemProps) {
  const [swipeX, setSwipeX] = useState(0);
  const [swiping, setSwiping] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setSwiping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.touches[0].clientY - touchStartY.current);

    // Only swipe if horizontal movement is greater than vertical
    if (Math.abs(deltaX) > deltaY && deltaX < 0) {
      setSwiping(true);
      setSwipeX(Math.max(deltaX, -100));
    }
  };

  const handleTouchEnd = () => {
    if (swipeX < -60) {
      onDelete(item.id);
    }
    setSwipeX(0);
    setSwiping(false);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden"
    >
      {/* Delete background */}
      <div className="absolute inset-y-0 right-0 w-24 bg-red-500 flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
        </svg>
      </div>

      {/* Item content */}
      <motion.div
        className={`flex items-center gap-3 px-4 py-3 bg-white ${isDragging ? "shadow-lg rounded-lg" : ""}`}
        style={{ x: swipeX }}
        animate={{ x: swiping ? undefined : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Drag handle */}
        <button
          className="touch-none text-neutral-300 hover:text-neutral-400 cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="9" cy="6" r="1.5" />
            <circle cx="15" cy="6" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="18" r="1.5" />
            <circle cx="15" cy="18" r="1.5" />
          </svg>
        </button>

        {/* Checkbox */}
        <button
          onClick={() => onToggle(item.id)}
          className="flex-shrink-0"
        >
          <motion.div
            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
              item.checked
                ? "bg-emerald-500 border-emerald-500"
                : "border-neutral-300 hover:border-neutral-400"
            }`}
            whileTap={{ scale: 0.9 }}
          >
            <AnimatePresence>
              {item.checked && (
                <motion.svg
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={3}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </motion.svg>
              )}
            </AnimatePresence>
          </motion.div>
        </button>

        {/* Text */}
        <span
          className={`flex-1 text-sm transition-all duration-200 ${
            item.checked
              ? "text-neutral-400 line-through"
              : "text-neutral-800"
          }`}
        >
          {item.text}
        </span>
      </motion.div>
    </motion.div>
  );
}
