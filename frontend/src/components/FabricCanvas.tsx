import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, FabricImage, Rect, FabricText, Group, Shadow, Point } from "fabric";
import type { DriveItem } from "../types";
import { eventBus } from "../events";
import { getApiBaseUrl } from "../api/client";
import { isDemoMode } from "../demo/demoMode";

/* ────────────────────────────────────────────────────────────────
 * FabricCanvas – Interactive canvas-based gallery view
 *
 * Uses Fabric.js to render gallery items as objects on an HTML5
 * canvas.  Supports zoom via mouse-wheel, pan via click-drag on
 * the background, selection of individual cards, and double-click
 * to open folders.
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
}

export function FabricCanvas({ items, selectedId, labels }: FabricCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<Canvas | null>(null);
  const [zoom, setZoom] = useState(1);

  const buildScene = useCallback(async (fc: Canvas) => {
    fc.clear();
    if (!items.length) return;

    const cols = Math.max(1, Math.floor((fc.width! - GAP) / (CARD_W + GAP)));

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
        width: CARD_W,
        height: CARD_H,
        rx: CORNER_R,
        ry: CORNER_R,
        fill: isSelected ? "#e8f0fe" : "#ffffff",
        stroke: isSelected ? "#4a90d9" : "#e2e2e2",
        strokeWidth: isSelected ? 2 : 1,
        shadow: new Shadow({ color: "rgba(0,0,0,0.08)", blur: 12, offsetY: 4, offsetX: 0 }),
      });

      /* Thumbnail area */
      let thumbObj: Rect | FabricImage;
      const thumbUrl = item.thumbnailLink
        ? isDemoMode()
          ? item.thumbnailLink
          : `${getApiBaseUrl()}/drive/thumbnail/${encodeURIComponent(item.id)}?size=220`
        : null;

      if (thumbUrl) {
        try {
          const img = await FabricImage.fromURL(thumbUrl, { crossOrigin: "anonymous" });
          img.scaleToWidth(CARD_W - 2);
          img.scaleToHeight(THUMB_H);
          img.set({ left: 1, top: 1, clipPath: new Rect({ width: CARD_W - 2, height: THUMB_H, rx: CORNER_R, ry: CORNER_R }) });
          thumbObj = img;
        } catch {
          thumbObj = new Rect({
            width: CARD_W - 2,
            height: THUMB_H,
            rx: CORNER_R,
            ry: CORNER_R,
            left: 1,
            top: 1,
            fill: isFolder
              ? "linear-gradient(135deg,#d4e7f7 0%,#b8d4f0 100%)"
              : "linear-gradient(135deg,#e8dcc6 0%,#d7e8ea 100%)",
          });
          thumbObj.set({ fill: isFolder ? "#d4e7f7" : "#e8dcc6" });
        }
      } else {
        thumbObj = new Rect({
          width: CARD_W - 2,
          height: THUMB_H,
          rx: CORNER_R,
          ry: CORNER_R,
          left: 1,
          top: 1,
          fill: isFolder ? "#d4e7f7" : "#e8dcc6",
        });
      }

      /* Icon in thumb area */
      const icon = new FabricText(isFolder ? "\uD83D\uDCC1" : "\uD83D\uDDBC", {
        fontSize: 36,
        left: CARD_W / 2 - 18,
        top: THUMB_H / 2 - 18,
        selectable: false,
      });

      /* Item name */
      const nameText = new FabricText(item.name.length > 24 ? item.name.slice(0, 22) + "…" : item.name, {
        fontSize: 13,
        fontFamily: "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
        fontWeight: "600",
        fill: "#1a1a2e",
        left: 12,
        top: THUMB_H + 12,
        width: CARD_W - 24,
      });

      /* Type label */
      const typeText = new FabricText(isFolder ? labels.folder : labels.file, {
        fontSize: 11,
        fontFamily: "'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif",
        fill: "#6b7280",
        left: 12,
        top: THUMB_H + 32,
      });

      const group = new Group([bg, thumbObj, icon, nameText, typeText], {
        left: x,
        top: y,
        selectable: false,
        hoverCursor: "pointer",
        subTargetCheck: false,
      });

      /* Store item reference for event dispatch */
      (group as unknown as Record<string, unknown>)._driveItem = item;
      fc.add(group);
    }

    fc.renderAll();
  }, [items, selectedId, labels]);

  /* Initialise Fabric canvas once */
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

    /* Click → select item */
    fc.on("mouse:down", (opt) => {
      const target = opt.target;
      if (!target) return;
      const item = (target as unknown as Record<string, unknown>)._driveItem as DriveItem | undefined;
      if (item) {
        eventBus.emit("gallery:select", { item });
      }
    });

    /* Double-click → navigate into folder */
    fc.on("mouse:dblclick", (opt) => {
      const target = opt.target;
      if (!target) return;
      const item = (target as unknown as Record<string, unknown>)._driveItem as DriveItem | undefined;
      if (item?.itemType === "folder") {
        eventBus.emit("gallery:navigate", { item });
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

  return (
    <div className="fabric-canvas-wrapper" ref={wrapperRef}>
      <div className="canvas-hud">
        <span className="zoom-badge">{Math.round(zoom * 100)}%</span>
      </div>
      <canvas ref={canvasRef} />
    </div>
  );
}
