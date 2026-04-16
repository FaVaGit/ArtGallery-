import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, Rect, FabricText, Group, Shadow, Point } from "fabric";
import type { DriveItem } from "../types";
import { eventBus } from "../events";
import { getApiBaseUrl } from "../api/client";

/* ────────────────────────────────────────────────────────────────
 * FabricCanvas – Interactive canvas-based gallery view
 *
 * Hover reveals elegant action icons (View / Open).  Single-click
 * on icons triggers lightbox (files) or navigation (folders).
 * Folder navigation uses a cinematic zoom transition.
 * ──────────────────────────────────────────────────────────── */

const CARD_W = 220;
const CARD_H = 260;
const GAP = 24;
const THUMB_H = 150;
const CORNER_R = 12;

interface FabricCanvasProps {
  items: DriveItem[];
  selectedId?: string;
  labels: { folder: string; file: string; open: string };
  folderPreviews?: Record<string, DriveItem[]>;
}

export function FabricCanvas({ items, selectedId, labels, folderPreviews }: FabricCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [zoom, setZoom] = useState(1);
  const [hoveredItem, setHoveredItem] = useState<DriveItem | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [transition, setTransition] = useState<"zoom-in" | "zoom-out" | null>(null);

  /* ── Zoom transition effect ─────────────────── */
  const triggerZoomTransition = useCallback((direction: "zoom-in" | "zoom-out") => {
    setTransition(direction);
    setTimeout(() => setTransition(null), 500);
  }, []);

  /* ── Listen for gallery:back to play zoom-out ── */
  useEffect(() => {
    const unsub = eventBus.on("gallery:back", () => triggerZoomTransition("zoom-out"));
    return unsub;
  }, [triggerZoomTransition]);

  const buildScene = useCallback(async (fc: Canvas) => {
    fc.clear();
    if (!items.length) return;

    const cols = Math.max(1, Math.floor((fc.width! - GAP) / (CARD_W + GAP)));

    /* Fabric v7 defaults to center origin; force top-left on all objects
       so coordinates work like v6.  The LayoutManager shifts children
       uniformly, preserving relative positions. */
    const TL = { originX: "left" as const, originY: "top" as const };

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = GAP + col * (CARD_W + GAP);
      const y = GAP + row * (CARD_H + GAP);
      const isFolder = item.itemType === "folder";
      const isSelected = item.id === selectedId;

      /* Card background */
      const bg = new Rect({
        ...TL,
        left: 0,
        top: 0,
        width: CARD_W,
        height: CARD_H,
        rx: CORNER_R,
        ry: CORNER_R,
        fill: isSelected ? "#faf3e6" : "#ffffff",
        stroke: isSelected ? "#c5a55a" : "#e0d6c8",
        strokeWidth: isSelected ? 2 : 1,
        shadow: new Shadow({ color: "rgba(44,36,24,0.08)", blur: 12, offsetY: 4, offsetX: 0 }),
      });

      /* Thumbnail area */
      const thumbObjects: (Rect | FabricImage | FabricText)[] = [];
      const previews = isFolder ? folderPreviews?.[item.id] : undefined;

      if (isFolder && previews && previews.length > 0) {
        const halfW = (CARD_W - 4) / 2;
        const halfH = THUMB_H / 2;
        const previewSlice = previews.slice(0, 4);
        for (let pi = 0; pi < previewSlice.length; pi++) {
          const px = 1 + (pi % 2) * (halfW + 1);
          const py = 1 + Math.floor(pi / 2) * halfH;
          try {
            const url = `${getApiBaseUrl()}/drive/thumbnail/${encodeURIComponent(previewSlice[pi].id)}?size=110`;
            const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });
            const scX = halfW / (img.width || halfW);
            const scY = halfH / (img.height || halfH);
            const sc = Math.max(scX, scY);
            img.set({ ...TL, left: px, top: py, scaleX: sc, scaleY: sc, clipPath: new Rect({ ...TL, width: halfW / sc, height: halfH / sc }) });
            thumbObjects.push(img);
          } catch {
            thumbObjects.push(new Rect({ ...TL, width: halfW, height: halfH, left: px, top: py, fill: "#e8ddd0" }));
          }
        }
      } else {
        const thumbUrl = item.thumbnailLink
          ? `${getApiBaseUrl()}/drive/thumbnail/${encodeURIComponent(item.id)}?size=220`
          : null;
        const tw = CARD_W - 2;
        const th = THUMB_H;

        if (thumbUrl) {
          try {
            const img = await FabricImage.fromURL(thumbUrl, { crossOrigin: "anonymous" });
            const scX = tw / (img.width || tw);
            const scY = th / (img.height || th);
            const sc = Math.max(scX, scY);
            img.set({ ...TL, left: 1, top: 1, scaleX: sc, scaleY: sc, clipPath: new Rect({ ...TL, width: tw / sc, height: th / sc, rx: CORNER_R / sc, ry: CORNER_R / sc }) });
            thumbObjects.push(img);
          } catch {
            thumbObjects.push(new Rect({
              ...TL, width: tw, height: th, rx: CORNER_R, ry: CORNER_R,
              left: 1, top: 1, fill: isFolder ? "#d4e7f7" : "#e8dcc6",
            }));
          }
        } else {
          thumbObjects.push(new Rect({
            ...TL, width: tw, height: th, rx: CORNER_R, ry: CORNER_R,
            left: 1, top: 1, fill: isFolder ? "#d4e7f7" : "#e8dcc6",
          }));
        }
      }

      /* Icon in thumb area (only when no real thumbnails) */
      const hasRealThumb = item.thumbnailLink || (isFolder && previews && previews.length > 0);
      if (!hasRealThumb) {
        thumbObjects.push(new FabricText(isFolder ? "\uD83D\uDCC1" : "\uD83D\uDDBC", {
          ...TL,
          fontSize: 36,
          left: CARD_W / 2 - 18,
          top: THUMB_H / 2 - 18,
          selectable: false,
        }));
      }

      /* Item name */
      const nameText = new FabricText(item.name.length > 24 ? item.name.slice(0, 22) + "\u2026" : item.name, {
        ...TL,
        fontSize: 13,
        fontFamily: "'Playfair Display', Georgia, serif",
        fontWeight: "600",
        fill: "#2c2418",
        left: 12,
        top: THUMB_H + 12,
      });

      /* Type label */
      const typeText = new FabricText(isFolder ? labels.folder : labels.file, {
        ...TL,
        fontSize: 11,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        fill: "#6b5e4f",
        left: 12,
        top: THUMB_H + 32,
      });

      const group = new Group([bg, ...thumbObjects, nameText, typeText], {
        ...TL,
        left: x,
        top: y,
        selectable: false,
        hoverCursor: "pointer",
        subTargetCheck: false,
      });

      (group as unknown as Record<string, unknown>)._driveItem = item;
      fc.add(group);
    }

    fc.renderAll();
  }, [items, selectedId, labels, folderPreviews]);

  /* ── Initialise Fabric canvas once ──────────── */
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const wrapper = wrapperRef.current!;
    const w = wrapper.clientWidth;
    const h = Math.max(500, wrapper.clientHeight);

    const fc = new Canvas(canvasRef.current, {
      width: w,
      height: h,
      backgroundColor: "transparent",
      selection: false,
    });

    /* Hover → show action overlay */
    fc.on("mouse:over", (opt) => {
      const target = opt.target;
      if (!target) return;
      const item = (target as unknown as Record<string, unknown>)._driveItem as DriveItem | undefined;
      if (!item) return;

      const bound = target.getBoundingRect();
      const canvasEl = fc.getElement();
      const canvasRect = canvasEl.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();

      setHoveredItem(item);
      setHoverPos({
        x: canvasRect.left - wrapperRect.left + bound.left,
        y: canvasRect.top - wrapperRect.top + bound.top,
        w: bound.width,
        h: bound.height,
      });
    });

    fc.on("mouse:out", (opt) => {
      const target = opt.target;
      if (!target) return;
      const item = (target as unknown as Record<string, unknown>)._driveItem as DriveItem | undefined;
      if (item) {
        setHoveredItem(null);
        setHoverPos(null);
      }
    });

    /* Click → open folder / view file */
    fc.on("mouse:down", (opt) => {
      const target = opt.target;
      if (!target) return;
      const item = (target as unknown as Record<string, unknown>)._driveItem as DriveItem | undefined;
      if (item) {
        if (item.itemType === "folder") {
          eventBus.emit("gallery:navigate", { item });
        } else {
          eventBus.emit("gallery:viewFile", { item });
        }
      }
    });

    /* Mouse-wheel → zoom */
    fc.on("mouse:wheel", (opt) => {
      const delta = (opt.e as WheelEvent).deltaY;
      let newZoom = fc.getZoom() * (1 - delta / 600);
      newZoom = Math.max(0.3, Math.min(3, newZoom));
      fc.zoomToPoint(new Point((opt.e as WheelEvent).offsetX, (opt.e as WheelEvent).offsetY), newZoom);
      opt.e.preventDefault();
      opt.e.stopPropagation();
      setZoom(newZoom);
      eventBus.emit("canvas:zoom", { level: newZoom });
    });

    fabricRef.current = fc;

    return () => {
      fc.dispose();
      fabricRef.current = null;
    };
  }, []);

  /* Rebuild scene when items / selection change */
  useEffect(() => {
    if (fabricRef.current) {
      buildScene(fabricRef.current).catch(() => undefined);
    }
  }, [buildScene]);

  /* Resize canvas on window resize */
  useEffect(() => {
    const handleResize = () => {
      const fc = fabricRef.current;
      const wrapper = wrapperRef.current;
      if (!fc || !wrapper) return;
      fc.setDimensions({ width: wrapper.clientWidth, height: Math.max(500, wrapper.clientHeight) });
      buildScene(fc).catch(() => undefined);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [buildScene]);

  /* ── Action handlers ────────────────────────── */
  function handleAction(item: DriveItem) {
    if (item.itemType === "folder") {
      triggerZoomTransition("zoom-in");
      setTimeout(() => eventBus.emit("gallery:navigate", { item }), 250);
    } else {
      eventBus.emit("gallery:viewFile", { item });
    }
  }

  const transitionClass = transition ? `canvas-transition canvas-transition--${transition}` : "";

  return (
    <div className="fabric-canvas-wrapper" ref={wrapperRef}>
      <div className="canvas-hud">
        <span className="zoom-badge">{Math.round(zoom * 100)}%</span>
      </div>

      <div className={`canvas-scene ${transitionClass}`}>
        <canvas ref={canvasRef} />
      </div>

      {/* Hover action overlay */}
      {hoveredItem && hoverPos && (
        <div
          className="canvas-hover-overlay"
          style={{
            left: hoverPos.x,
            top: hoverPos.y,
            width: hoverPos.w,
            height: THUMB_H * (hoverPos.h / CARD_H),
          }}
          onMouseLeave={() => { setHoveredItem(null); setHoverPos(null); }}
          onClick={() => handleAction(hoveredItem)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleAction(hoveredItem); } }}
          title={hoveredItem.itemType === "folder" ? labels.open : "View"}
        >
          <span className="canvas-overlay-icon">
            {hoveredItem.itemType === "folder" ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                <polyline points="12 11 12 17" />
                <polyline points="9 14 12 11 15 14" />
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
