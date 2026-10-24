"use client";

import { useCallback, useEffect, useRef } from "react";
import { animate, type AnimationPlaybackControls } from "motion/react";

const SLOP = 6; // px of mouse movement that turn a click into a drag

/**
 * Drag-to-scroll with momentum for a normal `overflow-x: auto` element.
 * Touch and trackpads already scroll natively. The mouse is handled here: dragging, and the
 * wheel, which moves the row sideways until its end (then the page scrolls on).
 *
 *   const { ref, bind } = useDragScroll<HTMLDivElement>();
 *   <div ref={ref} {...bind} className="overflow-x-auto">…</div>
 */
export function useDragScroll<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const st = useRef({ down: false, captured: false, id: -1, lastX: 0, lastT: 0, v: 0, moved: 0 });
  const momentum = useRef<AnimationPlaybackControls | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || el.scrollWidth <= el.clientWidth) return;
      const unit = e.deltaMode === 1 ? 16 : 1;
      const delta = (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY) * unit;
      const max = el.scrollWidth - el.clientWidth;
      // at the end of the row the wheel goes back to scrolling the page
      if (delta === 0 || (delta < 0 && el.scrollLeft <= 0) || (delta > 0 && el.scrollLeft >= max - 1)) return;
      e.preventDefault();
      momentum.current?.stop();
      el.scrollLeft += delta;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent<T>) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    momentum.current?.stop();
    Object.assign(st.current, {
      down: true,
      captured: false,
      id: e.pointerId,
      lastX: e.clientX,
      lastT: performance.now(),
      v: 0,
      moved: 0,
    });
  }, []);

  const onPointerMove = useCallback((e: React.PointerEvent<T>) => {
    const s = st.current;
    const el = ref.current;
    if (!s.down || !el) return;

    const dx = e.clientX - s.lastX;
    const now = performance.now();
    s.moved += Math.abs(dx);

    // Capture the pointer only once it really is a drag, so plain clicks reach the children.
    if (!s.captured && s.moved > SLOP) {
      el.setPointerCapture(s.id);
      s.captured = true;
    }
    if (s.captured) {
      el.scrollLeft -= dx;
      s.v = 0.8 * s.v + 0.2 * ((dx / Math.max(1, now - s.lastT)) * 1000);
    }
    s.lastX = e.clientX;
    s.lastT = now;
  }, []);

  const end = useCallback(() => {
    const s = st.current;
    const el = ref.current;
    if (!s.down) return;
    s.down = false;
    if (!el || !s.captured) return;

    if (el.hasPointerCapture(s.id)) el.releasePointerCapture(s.id);
    if (Math.abs(s.v) > 80) {
      momentum.current = animate(el.scrollLeft, el.scrollLeft, {
        type: "inertia",
        velocity: -s.v,
        power: 0.7,
        timeConstant: 350,
        restDelta: 1,
        onUpdate: (v) => {
          el.scrollLeft = v;
        },
      });
    }
  }, []);

  // The click that ends a drag must not open a product.
  const onClickCapture = useCallback((e: React.MouseEvent<T>) => {
    if (st.current.moved > SLOP) {
      e.preventDefault();
      e.stopPropagation();
      st.current.moved = 0;
    }
  }, []);

  return {
    ref,
    bind: { onPointerDown, onPointerMove, onPointerUp: end, onPointerCancel: end, onClickCapture },
  };
}
