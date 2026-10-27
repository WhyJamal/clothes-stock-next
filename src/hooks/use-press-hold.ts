"use client";

import { useCallback, useEffect, useRef } from "react";
import type { MouseEvent, PointerEvent } from "react";

const HOLD_MS = 300; // how long the finger has to stay on the item
const SLOP = 10; // px the finger may move and it still is a hold (more = a swipe)

/**
 * Press-and-hold for touch screens: the same as a mouse pointer resting on an item.
 * `onStart` runs when the finger has stayed on the item for a moment, `onEnd` when it is lifted
 * or the browser takes the touch for scrolling.
 * It also blocks the phone's long-press menu ("save image") and the click that ends a hold.
 *
 *   const hold = usePressHold({ onStart: show, onEnd: hide });
 *   <button {...hold}>…</button>
 */
export function usePressHold({ onStart, onEnd }: { onStart: () => void; onEnd: () => void }) {
  const handlers = useRef({ onStart, onEnd });
  useEffect(() => {
    handlers.current = { onStart, onEnd };
  });

  const st = useRef<{ timer: number | null; x: number; y: number; active: boolean; blockClickUntil: number }>({
    timer: null,
    x: 0,
    y: 0,
    active: false,
    blockClickUntil: 0,
  });

  const clearTimer = useCallback(() => {
    if (st.current.timer !== null) {
      window.clearTimeout(st.current.timer);
      st.current.timer = null;
    }
  }, []);
  useEffect(() => clearTimer, [clearTimer]);

  const stop = useCallback(() => {
    clearTimer();
    const s = st.current;
    if (!s.active) return;
    s.active = false;
    s.blockClickUntil = performance.now() + 500; // lifting the finger after a hold must not open the product
    handlers.current.onEnd();
  }, [clearTimer]);

  const onPointerDown = useCallback(
    (e: PointerEvent) => {
      if (e.pointerType === "mouse") return; // the mouse has real hover
      const s = st.current;
      s.x = e.clientX;
      s.y = e.clientY;
      clearTimer();
      s.timer = window.setTimeout(() => {
        s.timer = null;
        s.active = true;
        handlers.current.onStart();
      }, HOLD_MS);
    },
    [clearTimer],
  );

  const onPointerMove = useCallback(
    (e: PointerEvent) => {
      const s = st.current;
      if (s.timer !== null && Math.hypot(e.clientX - s.x, e.clientY - s.y) > SLOP) clearTimer();
    },
    [clearTimer],
  );

  const onClickCapture = useCallback((e: MouseEvent) => {
    if (performance.now() < st.current.blockClickUntil) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  // no "save image / open in new tab" menu on a long press
  const onContextMenu = useCallback((e: MouseEvent) => e.preventDefault(), []);

  return { onPointerDown, onPointerMove, onPointerUp: stop, onPointerCancel: stop, onClickCapture, onContextMenu };
}
