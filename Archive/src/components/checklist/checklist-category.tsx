"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { ChecklistItem } from "@/types/database";
import { ChecklistItemComponent } from "./checklist-item";
import { QuickAdd } from "./quick-add";

interface ChecklistCategoryProps {
  category: string;
  items: ChecklistItem[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onAdd: (text: string, category: string) => void;
  onReorder: (items: ChecklistItem[]) => void;
}

export function ChecklistCategory({
  category,
  items,
  onToggle,
  onDelete,
  onAdd,
  onReorder,
}: ChecklistCategoryProps) {
  const [collapsed, setCollapsed] = useState(false);
  const checkedCount = items.filter((i) => i.checked).length;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((i) => i.id === active.id);
    const newIndex = items.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(items, oldIndex, newIndex);
    onReorder(reordered);
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between px-4 py-2"
      >
        <div className="flex items-center gap-2">
          <motion.svg
            animate={{ rotate: collapsed ? -90 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-4 h-4 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </motion.svg>
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
            {category}
          </span>
        </div>
        <span className="text-xs text-neutral-400 tabular-nums">
          {checkedCount}/{items.length}
        </span>
      </button>

      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
                <AnimatePresence>
                  {items.map((item) => (
                    <ChecklistItemComponent
                      key={item.id}
                      item={item}
                      onToggle={onToggle}
                      onDelete={onDelete}
                    />
                  ))}
                </AnimatePresence>
              </SortableContext>
            </DndContext>

            <QuickAdd onAdd={(text) => onAdd(text, category)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
