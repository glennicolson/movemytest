"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";
import { GripVertical } from "lucide-react";

export type CardItem = {
  id: string;
  element: React.ReactNode;
};

type SortableCardGridProps = {
  storageKey: string;
  defaultOrder: string[];
  cards: Record<string, React.ReactNode>;
  /** Minimum card width in px before wrapping (default 220) */
  minWidth?: number;
};

export function SortableCardGrid({
  storageKey,
  defaultOrder,
  cards,
  minWidth = 220,
}: SortableCardGridProps) {
  const [order, setOrder] = useState<string[]>(() => {
    if (typeof window === "undefined") return defaultOrder;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved) as string[];
        const valid = parsed.filter((id) => id in cards);
        if (valid.length === defaultOrder.length) return valid;
      }
    } catch {
// Ignore
    }
    return defaultOrder;
  });

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [showGrip, setShowGrip] = useState(false);
  const dragCounter = useRef(0);

  const saveOrder = useCallback(
    (newOrder: string[]) => {
      setOrder(newOrder);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(storageKey, JSON.stringify(newOrder));
        } catch {
// Ignore
        }
      }
    },
    [storageKey]
  );

  useEffect(() => {
    const handleDragEnter = () => {
      dragCounter.current++;
      setShowGrip(true);
    };
    const handleDragLeave = () => {
      dragCounter.current--;
      if (dragCounter.current <= 0) {
        dragCounter.current = 0;
        setShowGrip(false);
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
    };
  }, []);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    (e.currentTarget as HTMLElement).style.opacity = "0.4";
  };

  const handleDragEnd = (e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).style.opacity = "1";
    setDragId(null);
    setDragOverId(null);
    setShowGrip(false);
    dragCounter.current = 0;
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!dragId || dragId === targetId) return;

    const newOrder = [...order];
    const dragIndex = newOrder.indexOf(dragId);
    const targetIndex = newOrder.indexOf(targetId);

    if (dragIndex === -1) return;

    newOrder.splice(dragIndex, 1);
    newOrder.splice(targetIndex, 0, dragId);
    saveOrder(newOrder);
  };

  const handleDragLeave = (e: React.DragEvent, id: string) => {
    if (dragOverId === id) {
      setDragOverId(null);
    }
  };

  return (
    <div
      className="grid gap-3"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${minWidth}px, 1fr))`,
      }}
    >
      {order.map((id) => {
        const isDragging = dragId === id;
        const isOver = dragOverId === id;

        return (
          <div
            key={id}
            draggable
            onDragStart={(e) => handleDragStart(e, id)}
            onDragEnd={handleDragEnd}
            onDragOver={(e) => handleDragOver(e, id)}
            onDragLeave={(e) => handleDragLeave(e, id)}
            className={cn(
              "relative rounded-xl transition-all",
              isDragging && "opacity-40",
              isOver && "ring-2 ring-[var(--brand)] ring-offset-2 scale-[1.02]",
              showGrip && "cursor-grab active:cursor-grabbing"
            )}
          >
            {showGrip && !isDragging && (
              <div className="absolute -top-2 -left-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md border border-slate-200 text-slate-400 pointer-events-none">
                <GripVertical className="h-3.5 w-3.5" />
              </div>
            )}
            {cards[id]}
          </div>
        );
      })}
    </div>
  );
}
