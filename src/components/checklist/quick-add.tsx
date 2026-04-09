"use client";

import { useState, useRef } from "react";

interface QuickAddProps {
  onAdd: (text: string) => void;
  placeholder?: string;
}

export function QuickAdd({ onAdd, placeholder = "Add item..." }: QuickAddProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onAdd(value.trim());
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-2">
      <div className="w-4" /> {/* Spacer for drag handle alignment */}
      <div className="w-5 h-5 rounded-full border-2 border-dashed border-neutral-200 flex-shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm text-neutral-800 placeholder:text-neutral-300 outline-none bg-transparent"
      />
      {value.trim() && (
        <button
          type="submit"
          className="text-xs font-medium text-blue-500 hover:text-blue-600"
        >
          Add
        </button>
      )}
    </form>
  );
}
