import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { BookTheme, PageData } from "../types";
import PageView from "./PageView";

import { RotateCcw } from "./icons";

const FLIP_MS = 850;
const MIN_TILT = 5;
const MAX_TILT = 27;
const MAX_TURN = 17;

interface FlipbookProps {
  pages: PageData[];
  theme: BookTheme;
  flipped: number;
  onFlip: (next: number) => void;
  onAnimatingChange?: (busy: boolean) => void;
}

interface AnimState {
  sheet: number;
  dir: "next" | "prev";
}

export default function Flipbook({
  pages,
  theme,
  flipped,
  onFlip,
  onAnimatingChange,
}: FlipbookProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [animating, setAnimating] = useState<AnimState | null>(null);
  const [rotX, setRotX] = useState(16);
  const [rotY, setRotY] = useState(-5);
  const [zoom, setZoom] = useState(1);
  const [heightScale, setHeightScale] = useState(1);
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [flat, setFlat] = useState(false);
  const prevFlippedRef = useRef(flipped);

  const numSheets = Math.max(1, Math.ceil(pages.length / 2));
  const dragRef = useRef({
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
    startRotX: 16,
    startRotY: -5,
  });

  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const update = () => setSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const previous = prevFlippedRef.current;
    if (flipped !== previous) {
      setAnimating({
        sheet: flipped > previous ? previous : flipped,
        dir: flipped > previous ? "next" : "prev",
      });
      prevFlippedRef.current = flipped;
    }
  }, [flipped]);

  useEffect(() => {
    onAnimatingChange?.(animating !== null);
    if (!animating) return;
    const timer = window.setTimeout(() => setAnimating(null), FLIP_MS + 60);
    return () => window.clearTimeout(timer);
  }, [animating, onAnimatingChange]);

  // Pause the cinematic orbit and flatten the camera whenever the visible
  // spread carries interactive media. Re-writing the ancestor 3D transform
  // every animation frame was forcing the video iframe to re-layout, which
  // stopped playback and swallowed clicks.
  const visiblePagesHaveMedia = [2 * flipped - 1, 2 * flipped].some(
    (i) =>
      pages[i] &&
      ((pages[i].video || "").trim().length > 0 ||
        ((pages[i].embedUrl || "").trim().length > 0 &&
          pages[i].embedType !== "none"))
  );
  const effectiveAutoOrbit =
    autoOrbit && !visiblePagesHaveMedia && !isDragging && !flat;
  const targetRotX = flat ? 0 : visiblePagesHaveMedia ? 8 : rotX;
  const targetRotY = flat ? 0 : visiblePagesHaveMedia ? 0 : rotY;

  useEffect(() => {
    if (visiblePagesHaveMedia) setAutoOrbit(false);
  }, [visiblePagesHaveMedia]);

  // The showcase stays inside a readable perspective view. It never spins the
  // book around or exposes the back like a flat image floating in space.
  useEffect(() => {
    if (!effectiveAutoOrbit) return;
    let frame = 0;
    const startedAt = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - startedAt) / 1000;
      setRotY(-3 + Math.sin(elapsed * 0.45) * 5);
      setRotX(16 + Math.cos(elapsed * 0.45) * 1.8);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [effectiveAutoOrbit]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      setZoom((value) =>
        clamp(value - event.deltaY * 0.0008, 0.72, 1.45)
      );
    };
    stage.addEventListener("wheel", handleWheel, { passive: false });
    return () => stage.removeEventListener("wheel", handleWheel);
  }, []);

  const startPerspectiveDrag = (clientX: number, clientY: number) => {
    setAutoOrbit(false);
    setIsDragging(true);
    dragRef.current = {
      active: true,
      moved: false,
      startX: clientX,
      startY: clientY,
      startRotX: rotX,
      startRotY: rotY,
    };
  };

  const movePerspectiveDrag = (clientX: number, clientY: number) => {
    const drag = dragRef.current;
    if (!drag.active) return;
    const dx = clientX - drag.startX;
    const dy = clientY - drag.startY;
    if (Math.abs(dx) + Math.abs(dy) > 5) drag.moved = true;
    
    let mappedDx = dx;
    let mappedDy = dy;
    if (isRotated) {
      mappedDx = dy;
      mappedDy = -dx;
    }
    
    setRotY(clamp(drag.startRotY + mappedDx * 0.08, -MAX_TURN, MAX_TURN));
    setRotX(clamp(drag.startRotX - mappedDy * 0.08, MIN_TILT, MAX_TILT));
  };

  const endPerspectiveDrag = () => {
    dragRef.current.active = false;
    setIsDragging(false);
  };

  const resetView = () => {
    setAutoOrbit(false);
    setRotX(16);
    setRotY(-5);
    setZoom(1);
    setHeightScale(1);
  };

  const goTo = (next: number) => {
    // Only suppress the flip if this click is the tail-end of an actual drag
    // gesture (more than a small threshold of movement). Small jitter should
    // still register as a click so the page flip works reliably.
    if (dragRef.current.moved) {
      dragRef.current.moved = false;
      return;
    }
    const clamped = Math.max(0, Math.min(numSheets, next));
    if (clamped === flipped) return;
    // Allow flipping even while another flip is in flight — this makes rapid
    // navigation feel responsive instead of dropping clicks silently.
    onFlip(clamped);
  };

  const bookRatio = isLandscape ? 2.8 : 1.4;
  const fitWidth = isRotated ? size.h : size.w;
  const fitHeight = isRotated ? size.w : size.h;
  const fit = computeFit(fitWidth, fitHeight, bookRatio);
  const pageDepth = clamp(fit.bh * 0.038, 12, 24) * heightScale;
  const boardThickness = clamp(fit.bh * 0.007, 2.5, 5) * heightScale;
  const leafGap = clamp(pageDepth / (numSheets + 8), 0.45, 1.35);
  const leftDepth =
    flipped > 0 ? 4 + pageDepth * (flipped / numSheets) : 0;
  const rightDepth =
    flipped < numSheets
      ? 4 + pageDepth * ((numSheets - flipped) / numSheets)
      : 0;

  const topics = pages
    .map((page, index) => ({ page, index }))
    .filter(({ page }) => page.variant === "chapter")
    .map(({ page, index }) => ({
      index,
      title: page.title.trim() || `Chapter ${index + 1}`,
      subtitle: page.subtitle.trim(),
    }));

  const jumpToPage = (pageIndex: number) => {
    onFlip(sheetForPageIndex(pageIndex));
  };

  const renderPage = (page: PageData | undefined, pageNumber: number) => {
    if (!page) return <BlankFace theme={theme} />;
    if (page.variant === "topics") {
      const linkedTopics = page.topicLinks.length
        ? page.topicLinks.map((link) => ({
            index: link.pageIndex,
            title: link.label,
            subtitle: page.subtitle,
          }))
        : topics;
      return (
        <TopicContextPage
          page={page}
          theme={theme}
          topics={linkedTopics}
          onJump={jumpToPage}
        />
      );
    }
    return <PageView page={page} theme={theme} pageNumber={pageNumber} />;
  };

  const sheets = Array.from({ length: numSheets }, (_, index) => {
    const frontPage = pages[2 * index];
    const backPage = pages[2 * index + 1];
    const isMoving = animating?.sheet === index;
    const rotation = isMoving
      ? animating.dir === "next"
        ? -180
        : 0
      : index < flipped
      ? -180
      : 0;

    // Each leaf occupies a distinct Z level. The visible leaf on either side
    // sits at the top while the remaining leaves step into the page block.
    const zOffset = isMoving
      ? boardThickness + 2
      : index < flipped
      ? -(flipped - 1 - index) * leafGap
      : -(index - flipped) * leafGap;
    const stackOrder = isMoving
      ? 9999
      : index < flipped
      ? index + 1
      : numSheets - index + 10;
    const isHardCover = index === 0 || index === numSheets - 1;
    const halfBoard = boardThickness / 2;
    // Prefer stable page IDs for the sheet key so React doesn't mistakenly
    // reuse DOM nodes when pages are added/removed/reordered — that was one
    // cause of the "flip sometimes doesn't work" bug.
    const sheetKey = frontPage?.id
      ? `sheet-${frontPage.id}-${backPage?.id ?? "blank"}`
      : `sheet-idx-${index}`;

    return (
      <div
        key={sheetKey}
        className={`sheet${isHardCover ? " hard-sheet" : ""}`}
        style={{
          transform: `translateZ(${zOffset}px) rotateY(${rotation}deg)`,
          zIndex: stackOrder,
        }}
      >
        <div
          className="face front"
          style={
            isHardCover
              ? { transform: `translateZ(${halfBoard}px)` }
              : undefined
          }
        >
          {renderPage(frontPage, 2 * index + 1)}
        </div>
        <div
          className="face back"
          style={
            isHardCover
              ? {
                  transform: `rotateY(180deg) translateZ(${halfBoard}px)`,
                }
              : undefined
          }
        >
          {renderPage(backPage, 2 * index + 2)}
        </div>
        {isHardCover && (
          <CoverEdges
            thickness={boardThickness}
            color={shadeHex(theme.accent, -0.3)}
          />
        )}
      </div>
    );
  });

  const bookShiftX = flipped === 0 ? -25 : flipped === numSheets ? 25 : 0;
  const perspective = clamp(fit.bw * 1.7, 1150, 2200);

  return (
    <div
      ref={stageRef}
      onMouseDown={(event) =>
        startPerspectiveDrag(event.clientX, event.clientY)
      }
      onMouseMove={(event) =>
        movePerspectiveDrag(event.clientX, event.clientY)
      }
      onMouseUp={endPerspectiveDrag}
      onMouseLeave={endPerspectiveDrag}
      onTouchStart={(event) => {
        const touch = event.touches[0];
        if (touch) startPerspectiveDrag(touch.clientX, touch.clientY);
      }}
      onTouchMove={(event) => {
        const touch = event.touches[0];
        if (touch) movePerspectiveDrag(touch.clientX, touch.clientY);
      }}
      onTouchEnd={endPerspectiveDrag}
      className={`relative flex h-full min-h-0 w-full touch-none items-center justify-center ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
    >
      {fit.bw > 20 && (
        <div
          className="flip-scene"
          style={{
            width: fit.bw,
            height: fit.bh,
            position: "relative",
            perspective: `${perspective}px`,
            perspectiveOrigin: "50% 36%",
            transform: isRotated ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.5s ease",
          }}
        >
          <div
            className="book-pivot"
            style={{
              position: "absolute",
              inset: 0,
              transform: `rotateX(${targetRotX}deg) rotateY(${targetRotY}deg) scale(${zoom})`,
            }}
          >
            <div
              className="book"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                transform: `translate3d(${bookShiftX}%, 0, 0)`,
              }}
            >
              <BookHalfVolume
                side="left"
                depth={leftDepth}
                boardThickness={boardThickness}
                theme={theme}
              />
              <BookHalfVolume
                side="right"
                depth={rightDepth}
                boardThickness={boardThickness}
                theme={theme}
              />

              {sheets}

              <div
                className="book-gutter"
                style={{
                  opacity:
                    flipped === 0 || flipped === numSheets ? 0 : 1,
                }}
              />
            </div>
          </div>

          <div
            className="book-shadow"
            style={{
              opacity: 0.42 + heightScale * 0.12,
              transform: `translateX(${rotY * 0.35}px) scale(${0.88 +
                zoom * 0.12})`,
            }}
          />

          {/* Edge-strip turn zones. They used to cover the full left/right
              halves and sat ABOVE the page, which made the Topics page a dead
              end (both zones were disabled) and blocked video/link clicks. */}
          <ClickZone
            side="left"
            disabled={flipped <= 0}
            onClick={() => goTo(flipped - 1)}
          />
          <ClickZone
            side="right"
            disabled={flipped >= numSheets}
            onClick={() => goTo(flipped + 1)}
          />
        </div>
      )}

      <div
        className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-3 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2.5 shadow-2xl backdrop-blur-xl"
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsLandscape((l) => !l)}
          className="cursor-pointer rounded-md border border-white/10 bg-slate-900/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Toggle Portrait/Landscape"
        >
          {isLandscape ? "Landscape" : "Portrait"}
        </button>

        <button
          onClick={() => setIsRotated((r) => !r)}
          className="cursor-pointer rounded-md border border-white/10 bg-slate-900/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Rotate 90°"
        >
          {isRotated ? "0°" : "90°"}
        </button>

        <button
          onClick={() => {
            setFlat((f) => !f);
            setAutoOrbit(false);
          }}
          className={
            flat
              ? "cursor-pointer rounded-md border border-emerald-400/50 bg-emerald-500/25 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-emerald-200 transition"
              : "cursor-pointer rounded-md border border-white/10 bg-slate-900/60 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-300 transition hover:bg-white/10 hover:text-white"
          }
          title="Flatten the book so video, maps and embeds are fully interactive"
        >
          {flat ? "3D" : "Flat"}
        </button>

        <div className="h-5 w-px bg-white/10" />

        <label className="flex items-center gap-1 text-[10px] text-slate-300 whitespace-nowrap">
          <span className="font-mono text-xs">Zoom</span>
          <input
            type="range"
            min={0.72}
            max={1.45}
            step={0.01}
            value={zoom}
            onChange={(e) => { setAutoOrbit(false); setZoom(parseFloat(e.target.value)); }}
            className="w-14 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </label>

        <label className="flex items-center gap-1 text-[10px] text-slate-300 whitespace-nowrap">
          <span className="font-mono text-xs">Height</span>
          <input
            type="range"
            min={0.6}
            max={1.8}
            step={0.05}
            value={heightScale}
            onChange={(e) => setHeightScale(parseFloat(e.target.value))}
            className="w-14 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
          />
        </label>

        <button
          onClick={resetView}
          className="cursor-pointer rounded-md p-1 text-slate-400 transition hover:text-white hover:bg-white/5"
          title="Reset"
        >
          <RotateCcw className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function BookHalfVolume({
  side,
  depth,
  boardThickness,
  theme,
}: {
  side: "left" | "right";
  depth: number;
  boardThickness: number;
  theme: BookTheme;
}) {
  if (depth <= 0) return null;
  const paperLight = shadeHex(theme.paper, -0.035);
  const paperMid = shadeHex(theme.paper, -0.11);
  const paperDark = shadeHex(theme.paper, -0.2);
  const board = shadeHex(theme.accent, -0.34);
  const outerAt = side === "left" ? { left: 0 } : { left: "100%" };
  const spineAt = side === "left" ? { left: "100%" } : { left: 0 };
  const edgeTexture = `repeating-linear-gradient(to bottom, ${paperLight} 0px, ${paperLight} 1px, ${paperMid} 1.5px, ${paperLight} 2.5px)`;

  return (
    <div
      className="book-half-volume"
      style={{ left: side === "left" ? 0 : "50%" }}
    >
      <div
        className="volume-back"
        style={{
          background: paperDark,
          transform: `translateZ(${-depth}px)`,
        }}
      />
      <div
        className="volume-edge volume-edge-vertical"
        style={{
          ...outerAt,
          width: depth,
          background: edgeTexture,
          transform: "rotateY(90deg)",
        }}
      />
      <div
        className="volume-edge volume-edge-vertical volume-spine-edge"
        style={{
          ...spineAt,
          width: depth,
          background: `linear-gradient(to right, ${paperDark}, ${paperMid})`,
          transform: "rotateY(90deg)",
        }}
      />
      <div
        className="volume-edge volume-edge-horizontal volume-edge-bottom"
        style={{
          height: depth,
          background: edgeTexture,
          transform: "rotateX(-90deg)",
        }}
      />
      <div
        className="volume-edge volume-edge-horizontal volume-edge-top"
        style={{
          height: depth,
          background: `linear-gradient(to bottom, ${paperLight}, ${paperMid})`,
          transform: "rotateX(-90deg)",
        }}
      />

      <div
        className="cover-board-base"
        style={{
          background: board,
          transform: `translateZ(${-depth - boardThickness}px)`,
        }}
      />
      <div
        className="cover-board-lip cover-board-bottom"
        style={{
          height: boardThickness,
          background: shadeHex(board, -0.13),
          transform: `translateZ(${-depth}px) rotateX(-90deg)`,
        }}
      />
    </div>
  );
}

function TopicContextPage({
  page,
  theme,
  topics,
  onJump,
}: {
  page: PageData;
  theme: BookTheme;
  topics: { index: number; title: string; subtitle: string }[];
  onJump: (pageIndex: number) => void;
}) {
  const accent = page.accent || theme.accent;
  const ink = page.ink || theme.ink;
  const background = page.bg || theme.paper;
  const visibleTopics =
    topics.length > 0
      ? topics
      : page.body
          .split(/\n+/)
          .map((title, index) => ({
            index,
            title: title.trim(),
            subtitle: "",
          }))
          .filter((topic) => topic.title);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        containerType: "size",
        background,
        color: ink,
        overflow: "hidden",
        zIndex: 1,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 20% 10%, rgba(255,255,255,0.18), transparent 35%), radial-gradient(circle at 80% 90%, rgba(0,0,0,0.08), transparent 40%)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          padding: "8cqmin 9cqmin",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            color: accent,
            fontSize: "2.7cqmin",
            fontWeight: 800,
            letterSpacing: "0.35em",
            textTransform: "uppercase",
            marginBottom: "2cqmin",
          }}
        >
          {page.subtitle || "Topic Context"}
        </div>
        <h2
          style={{
            fontSize: "7cqmin",
            lineHeight: 1,
            fontWeight: 850,
            letterSpacing: "-0.03em",
            marginBottom: "5cqmin",
          }}
        >
          {page.title || "Contents"}
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "2cqmin 4cqmin",
            alignContent: "start",
          }}
        >
          {visibleTopics.map((topic, order) => (
            <button
              key={`${topic.index}-${topic.title}`}
              onClick={(event) => {
                event.stopPropagation();
                onJump(topic.index);
              }}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "2cqmin",
                alignItems: "baseline",
                padding: "1.8cqmin 0",
                border: 0,
                borderBottom: `1px solid ${accent}33`,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
              }}
              title={`Open ${topic.title}`}
            >
              <span
                style={{
                  color: accent,
                  fontSize: "2.9cqmin",
                  fontWeight: 850,
                  letterSpacing: "0.16em",
                }}
              >
                {String(order + 1).padStart(2, "0")}
              </span>
              <span>
                <span
                  style={{
                    display: "block",
                    fontSize: "4cqmin",
                    lineHeight: 1.1,
                    fontWeight: 720,
                  }}
                >
                  {topic.title}
                </span>
                {topic.subtitle && (
                  <span
                    style={{
                      display: "block",
                      marginTop: "0.8cqmin",
                      color: accent,
                      fontSize: "2.1cqmin",
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                    }}
                  >
                    {topic.subtitle}
                  </span>
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CoverEdges({
  thickness,
  color,
}: {
  thickness: number;
  color: string;
}) {
  const half = thickness / 2;
  return (
    <>
      <div
        className="sheet-edge sheet-edge-outer"
        style={{
          width: thickness,
          background: color,
          transform: `translateZ(${half}px) rotateY(90deg)`,
        }}
      />
      <div
        className="sheet-edge sheet-edge-bottom"
        style={{
          height: thickness,
          background: shadeHex(color, -0.12),
          transform: `translateZ(${half}px) rotateX(-90deg)`,
        }}
      />
      <div
        className="sheet-edge sheet-edge-top"
        style={{
          height: thickness,
          background: shadeHex(color, 0.06),
          transform: `translateZ(${half}px) rotateX(-90deg)`,
        }}
      />
    </>
  );
}

function computeFit(width: number, height: number, bookRatio: number) {
  if (width <= 0 || height <= 0) return { bw: 0, bh: 0 };
  const margin = 0.88;
  let bw: number;
  let bh: number;
  if (width / height > bookRatio) {
    bh = height * margin;
    bw = bh * bookRatio;
  } else {
    bw = width * margin;
    bh = bw / bookRatio;
  }
  if (bw > 1500) {
    bw = 1500;
    bh = bw / bookRatio;
  }
  return { bw: Math.round(bw), bh: Math.round(bh) };
}

function ClickZone({
  side,
  onClick,
  disabled,
}: {
  side: "left" | "right";
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      aria-label={side === "left" ? "Previous page" : "Next page"}
      aria-disabled={disabled}
      onClick={() => {
        if (!disabled) onClick();
      }}
      style={{
        position: "absolute",
        background: "transparent",
        border: "none",
        cursor: disabled
          ? "grab"
          : side === "left"
          ? "w-resize"
          : "e-resize",
        zIndex: 50,
        opacity: 0,
        pointerEvents: disabled ? "none" : "auto",
        // Narrow strip at the outer edge only, vertically centred, so page
        // content (topic links, images, video players, buttons) stays clickable.
        width: "13%",
        height: "62%",
        top: "19%",
        ...(side === "left" ? { left: 0 } : { right: 0 }),
      }}
    />
  );
}

function BlankFace({ theme }: { theme: BookTheme }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: theme.paper,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: "50%",
          border: `1px solid ${theme.accent}`,
          opacity: 0.2,
        }}
      />
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function sheetForPageIndex(index: number): number {
  return index % 2 === 0 ? index / 2 : (index + 1) / 2;
}

function shadeHex(color: string, amount: number): string {
  const match = /^#([0-9a-f]{6}|[0-9a-f]{3})$/i.exec(color.trim());
  if (!match) return color;
  const value =
    match[1].length === 3
      ? match[1]
          .split("")
          .map((char) => char + char)
          .join("")
      : match[1];
  const number = parseInt(value, 16);
  const channels = [number >> 16, (number >> 8) & 255, number & 255].map(
    (channel) => clamp(Math.round(channel + 255 * amount), 0, 255)
  );
  return `#${channels
    .map((channel) => channel.toString(16).padStart(2, "0"))
    .join("")}`;
}