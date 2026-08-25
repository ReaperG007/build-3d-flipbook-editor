import { useCallback, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import type {
  Align,
  BookTheme,
  LayoutElement,
  LayoutElementKind,
  PageData,
} from "../types";
import PageView from "./PageView";

interface PageMapperProps {
  page: PageData;
  theme: BookTheme;
  onUpdatePage: (patch: Partial<PageData>) => void;
}

const MIN_W = 6;
const MIN_H = 6;
const STAGE_W = 100;
const STAGE_H = 100;

type DragMode = "move" | "resize" | "none";

interface DragState {
  id: string;
  mode: DragMode;
  startX: number;
  startY: number;
  startBox: { x: number; y: number; width: number; height: number };
}

export default function PageMapper({
  page,
  theme,
  onUpdatePage,
}: PageMapperProps) {
  const elements = page.layout.elements;
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const updateElement = useCallback(
    (id: string, patch: Partial<LayoutElement>) => {
      const next = elements.map((el) =>
        el.id === id
          ? { ...el, ...patch, box: { ...el.box, ...(patch.box ?? {}) } }
          : el
      );
      onUpdatePage({ layout: { elements: next } });
    },
    [elements, onUpdatePage]
  );

  const removeElement = useCallback(
    (id: string) => {
      onUpdatePage({
        layout: { elements: elements.filter((el) => el.id !== id) },
      });
      if (activeId === id) setActiveId(null);
    },
    [elements, activeId, onUpdatePage]
  );

  const addElement = useCallback(
    (kind: LayoutElementKind) => {
      const id = makeLocalId(kind);
      const defaults: Record<LayoutElementKind, LayoutElement> = {
        text: {
          id,
          kind: "text",
          label: "Text block",
          box: { x: 8, y: 8, width: 60, height: 25 },
          fontSize: 1,
          objectFit: "cover",
          align: "left",
        },
        image: {
          id,
          kind: "image",
          label: "Image",
          box: { x: 15, y: 25, width: 70, height: 38 },
          fontSize: 1,
          objectFit: "cover",
          align: "left",
        },
        video: {
          id,
          kind: "video",
          label: "Video",
          box: { x: 15, y: 50, width: 70, height: 36 },
          fontSize: 1,
          objectFit: "cover",
          align: "left",
        },
        button: {
          id,
          kind: "button",
          label: "3D Link Button",
          box: { x: 20, y: 75, width: 60, height: 14 },
          fontSize: 1,
          objectFit: "cover",
          align: "center",
        },
        embed: {
          id,
          kind: "embed",
          label: "Map / Social Embed",
          box: { x: 10, y: 35, width: 80, height: 45 },
          fontSize: 1,
          objectFit: "cover",
          align: "center",
        },
      };
      onUpdatePage({ layout: { elements: [...elements, defaults[kind]] } });
      setActiveId(id);
    },
    [elements, onUpdatePage]
  );

  const resetLayout = () => {
    onUpdatePage({ layout: { elements: [] } });
    setActiveId(null);
  };

  const startDrag = (
    event: React.PointerEvent,
    element: LayoutElement,
    mode: DragMode
  ) => {
    event.preventDefault();
    event.stopPropagation();
    (event.target as HTMLElement).setPointerCapture?.(event.pointerId);
    dragRef.current = {
      id: element.id,
      mode,
      startX: event.clientX,
      startY: event.clientY,
      startBox: { ...element.box },
    };
    setActiveId(element.id);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0 || rect.height === 0) return;
    const dx = ((event.clientX - drag.startX) / rect.width) * STAGE_W;
    const dy = ((event.clientY - drag.startY) / rect.height) * STAGE_H;

    const next = { ...drag.startBox };
    if (drag.mode === "move") {
      next.x = clamp(drag.startBox.x + dx, 0, STAGE_W - drag.startBox.width);
      next.y = clamp(drag.startBox.y + dy, 0, STAGE_H - drag.startBox.height);
    } else if (drag.mode === "resize") {
      next.width = clamp(drag.startBox.width + dx, MIN_W, STAGE_W - drag.startBox.x);
      next.height = clamp(
        drag.startBox.height + dy,
        MIN_H,
        STAGE_H - drag.startBox.y
      );
    }
    updateElement(drag.id, { box: next });
  };

  const endDrag = (event: React.PointerEvent) => {
    if (!dragRef.current) return;
    (event.target as HTMLElement).releasePointerCapture?.(event.pointerId);
    dragRef.current = null;
  };

  // The stage mirrors the real page proportions so the clone is a true
  // WYSIWYG representation of what renders inside the 3D book.
  const stageStyle: CSSProperties = {
    position: "relative",
    width: "100%",
    aspectRatio: "0.7 / 1",
    borderRadius: 6,
    overflow: "hidden",
    userSelect: "none",
    touchAction: "none",
    background: page.bg || theme.paper,
    boxShadow: "0 8px 26px rgba(0,0,0,0.4)",
  };

  const activeElement = useMemo(
    () => elements.find((el) => el.id === activeId) ?? null,
    [elements, activeId]
  );

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={stageRef}
        style={stageStyle}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onClick={() => setActiveId(null)}
      >
        {/* ── Exact clone of the real page ───────────────────────────────
            Renders the genuine PageView (real layout, typography, images,
            video, embeds, 3D buttons). Pointer events are disabled so the
            drag handles above remain fully interactive. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 1,
          }}
        >
          <PageView page={page} theme={theme} preview />
        </div>

        {/* Dimming scrim so the drag frames read clearly over any artwork */}
        {elements.length > 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              pointerEvents: "none",
              background:
                "linear-gradient(135deg, rgba(2,6,23,0.28), rgba(2,6,23,0.42))",
            }}
          />
        )}

        {/* ── Draggable / resizable layout blocks ───────────────────────── */}
        {elements.map((el) => {
          const isActive = activeId === el.id;
          return (
            <div
              key={el.id}
              onPointerDown={(e) => startDrag(e, el, "move")}
              onClick={(e) => {
                e.stopPropagation();
                setActiveId(el.id);
              }}
              style={{
                position: "absolute",
                left: `${el.box.x}%`,
                top: `${el.box.y}%`,
                width: `${el.box.width}%`,
                height: `${el.box.height}%`,
                zIndex: 5,
                border: isActive
                  ? "1.5px solid #a78bfa"
                  : "1px dashed rgba(167,139,250,0.75)",
                borderRadius: 4,
                background: isActive
                  ? "rgba(139,92,246,0.18)"
                  : "rgba(139,92,246,0.08)",
                boxShadow: isActive
                  ? "0 0 0 3px rgba(139,92,246,0.25)"
                  : "none",
                cursor: "grab",
                touchAction: "none",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div
                style={{
                  fontSize: 8,
                  fontWeight: 700,
                  letterSpacing: "0.14em",
                  textTransform: "uppercase",
                  padding: "2px 4px",
                  background: isActive ? "#8b5cf6" : "rgba(15,23,42,0.82)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 4,
                  flexShrink: 0,
                }}
              >
                <span style={{ pointerEvents: "none" }}>
                  {kindGlyph(el.kind)} {el.label}
                </span>
                <span
                  style={{
                    fontSize: 7,
                    opacity: 0.85,
                    pointerEvents: "none",
                    fontFamily: "monospace",
                  }}
                >
                  {Math.round(el.box.width)}×{Math.round(el.box.height)}
                </span>
              </div>

              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  color: "rgba(226,232,240,0.75)",
                  letterSpacing: "0.08em",
                  overflow: "hidden",
                  pointerEvents: "none",
                  textAlign: el.align === "center" ? "center" : "left",
                }}
              >
                {kindHint(el.kind, page)}
              </div>

              <div
                onPointerDown={(e) => startDrag(e, el, "resize")}
                style={{
                  position: "absolute",
                  right: -5,
                  bottom: -5,
                  width: 13,
                  height: 13,
                  borderRadius: 3,
                  background: isActive ? "#a78bfa" : "rgba(226,232,240,0.85)",
                  border: "1.5px solid #0f172a",
                  cursor: "nwse-resize",
                  zIndex: 6,
                }}
                title="Drag to resize"
              />
            </div>
          );
        })}

        {elements.length === 0 && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 4,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 4,
              color: "rgba(255,255,255,0.72)",
              fontSize: 10,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textAlign: "center",
              pointerEvents: "none",
              textShadow: "0 1px 4px rgba(0,0,0,0.8)",
            }}
          >
            <span>Live page preview</span>
            <span style={{ opacity: 0.7, letterSpacing: "0.08em" }}>
              add a block to reposition content
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => addElement("text")}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-200 transition hover:bg-white/10"
        >
          + Text
        </button>
        <button
          onClick={() => addElement("image")}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-200 transition hover:bg-white/10"
        >
          + Image
        </button>
        <button
          onClick={() => addElement("video")}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-medium text-slate-200 transition hover:bg-white/10"
        >
          + Video
        </button>
        <button
          onClick={() => addElement("button")}
          className="rounded-md border border-white/10 bg-violet-500/20 px-2 py-1 text-[10px] font-medium text-violet-200 transition hover:bg-violet-500/30"
        >
          + 3D Link
        </button>
        <button
          onClick={() => addElement("embed")}
          className="rounded-md border border-white/10 bg-emerald-500/20 px-2 py-1 text-[10px] font-medium text-emerald-200 transition hover:bg-emerald-500/30"
        >
          + Embed
        </button>
        <button
          onClick={resetLayout}
          disabled={elements.length === 0}
          className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-400 transition hover:bg-white/10 disabled:opacity-40"
        >
          Reset
        </button>
      </div>

      {activeElement && (
        <div className="grid grid-cols-2 gap-2 rounded-lg border border-white/10 bg-slate-900/50 p-2 text-[11px] text-slate-200">
          <label className="col-span-2 flex items-center gap-2">
            <span className="w-12 shrink-0 text-slate-400">Label</span>
            <input
              value={activeElement.label}
              onChange={(e) =>
                updateElement(activeElement.id, { label: e.target.value })
              }
              className="w-full rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 outline-none focus:border-violet-400/60"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-slate-400">Size</span>
            <input
              type="range"
              min={0.6}
              max={2.2}
              step={0.1}
              value={activeElement.fontSize}
              onChange={(e) =>
                updateElement(activeElement.id, {
                  fontSize: Number(e.target.value),
                })
              }
              className="w-full accent-violet-500"
            />
            <span className="w-8 text-right font-mono">
              {activeElement.fontSize.toFixed(1)}×
            </span>
          </label>
          <label className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-slate-400">Fit</span>
            <select
              value={activeElement.objectFit}
              onChange={(e) =>
                updateElement(activeElement.id, {
                  objectFit: e.target.value as "cover" | "contain",
                })
              }
              className="w-full rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 outline-none focus:border-violet-400/60"
            >
              <option value="cover">cover</option>
              <option value="contain">contain</option>
            </select>
          </label>
          <label className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-slate-400">Align</span>
            <select
              value={activeElement.align}
              onChange={(e) =>
                updateElement(activeElement.id, {
                  align: e.target.value as Align,
                })
              }
              className="w-full rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 outline-none focus:border-violet-400/60"
            >
              <option value="left">left</option>
              <option value="center">center</option>
              <option value="right">right</option>
            </select>
          </label>
          <div className="flex items-center gap-2">
            <span className="w-12 shrink-0 text-slate-400">Pos</span>
            <span className="font-mono text-[10px] text-slate-400">
              {Math.round(activeElement.box.x)},{Math.round(activeElement.box.y)} ·{" "}
              {Math.round(activeElement.box.width)}×
              {Math.round(activeElement.box.height)}
            </span>
          </div>
          <button
            onClick={() => removeElement(activeElement.id)}
            className="col-span-2 rounded-md border border-white/10 bg-rose-500/10 px-2 py-1 text-rose-200 transition hover:bg-rose-500/20"
          >
            Remove block
          </button>
        </div>
      )}
    </div>
  );
}

function kindGlyph(kind: LayoutElementKind): string {
  switch (kind) {
    case "text":
      return "✎";
    case "image":
      return "🖼";
    case "video":
      return "▶";
    case "button":
      return "🔗";
    case "embed":
      return "🗺";
    default:
      return "◦";
  }
}

function kindHint(kind: LayoutElementKind, page: PageData): string {
  switch (kind) {
    case "text":
      return page.body?.slice(0, 48) || page.title || "Text content";
    case "image":
      return page.images?.length
        ? `${page.images.length} image${page.images.length > 1 ? "s" : ""}`
        : page.image
        ? "Page image"
        : "No image set";
    case "video":
      return page.video ? "Video player" : "No video link";
    case "button":
      return page.linkLabel || page.linkUrl || "3D link button";
    case "embed":
      return page.embedTitle || page.embedUrl || "Map / social embed";
    default:
      return "";
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function makeLocalId(kind: LayoutElementKind): string {
  return `${kind}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2, 6)}`;
}
