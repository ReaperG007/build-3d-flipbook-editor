import { useCallback, useEffect, useRef, useState } from "react";
import Editor from "./components/Editor";
import Flipbook from "./components/Flipbook";
import PageView from "./components/PageView";
import {
  ChevronLeft,
  ChevronRight,
  Expand,
  Sparkles,
  X,
} from "./components/icons";
import {
  blankPage,
  type BookDoc,
  type BookTheme,
  type PageData,
  makeId,
  SAMPLE_BOOK,
} from "./types";
import { cn } from "./utils/cn";

// Bumped so books saved by older builds (missing the images/video/embed schema)
// don't keep masking the fixed sample content.
const STORAGE_KEY = "flipbook.studio.v2";

function loadDoc(): BookDoc {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const doc = normalizeDoc(parsed);
      if (doc) return doc;
    }
  } catch {
    /* ignore */
  }
  return cloneDoc(SAMPLE_BOOK);
}

function cloneDoc(d: BookDoc): BookDoc {
  return JSON.parse(JSON.stringify(d)) as BookDoc;
}

function topicContextPage(): PageData {
  return blankPage({
    variant: "topics",
    title: "Contents",
    subtitle: "Topic Context",
    body: "",
    font: "display",
    pageNumber: false,
  });
}

function topicLinksFromPages(pages: PageData[]): PageData["topicLinks"] {
  return pages
    .map((page, index) => ({ page, index }))
    .filter(({ page }) => page.variant === "chapter" && page.title.trim())
    .map(({ page, index }) => ({
      id: makeId(),
      label: page.title.trim(),
      pageIndex: index,
    }));
}

function ensureTopicContextPage(pages: PageData[]): PageData[] {
  const next = pages.slice();
  const topicLinks = topicLinksFromPages(next);
  const topicBody = topicLinks.map((link) => link.label).join("\n");
  const existingIndex = next.findIndex((page) => page.variant === "topics");
  if (existingIndex >= 0) {
    if (next[existingIndex].topicLinks.length === 0 && topicLinks.length > 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        topicLinks,
        body: next[existingIndex].body.trim() || topicBody,
      };
    }
    return next;
  }
  const insertAt = next[0]?.variant === "cover" ? 1 : 0;
  next.splice(insertAt, 0, {
    ...topicContextPage(),
    body: topicBody,
    topicLinks,
  });
  return next;
}

function normalizeLayout(raw: unknown): PageData["layout"] {
  if (!raw || typeof raw !== "object") return { elements: [] };
  const obj = raw as { elements?: unknown };
  if (!Array.isArray(obj.elements)) return { elements: [] };
  return {
    elements: obj.elements
      .map((item) => {
        if (!item || typeof item !== "object") return null;
        const record = item as Record<string, unknown>;
        const box = (record.box ?? {}) as Record<string, unknown>;
        return {
          id: typeof record.id === "string" ? record.id : makeId(),
          kind:
            record.kind === "image" || record.kind === "video"
              ? (record.kind as "image" | "video")
              : "text",
          label: String(record.label ?? "Element"),
          box: {
            x: clamp(Number(box.x ?? 5), 0, 100),
            y: clamp(Number(box.y ?? 5), 0, 100),
            width: clamp(Number(box.width ?? 40), 4, 100),
            height: clamp(Number(box.height ?? 20), 4, 100),
          },
          fontSize: clamp(Number(record.fontSize ?? 1), 0.6, 2.4),
          objectFit: record.objectFit === "contain" ? "contain" : "cover",
          align:
            record.align === "center" || record.align === "right"
              ? (record.align as "center" | "right")
              : "left",
        };
      })
      .filter(Boolean) as PageData["layout"]["elements"],
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function normalizeGallery(raw: unknown): PageData["gallery"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as Record<string, unknown>;
      return {
        id: typeof record.id === "string" ? record.id : makeId(),
        url: String(record.url ?? ""),
        caption: String(record.caption ?? ""),
        mapToPage: Math.max(0, Number(record.mapToPage ?? 0) || 0),
      };
    })
    .filter((item): item is PageData["gallery"][number] => item !== null);
}

function normalizeTopicLinks(raw: unknown): PageData["topicLinks"] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((link) => {
      if (!link || typeof link !== "object") return null;
      const record = link as Record<string, unknown>;
      return {
        id: typeof record.id === "string" ? record.id : makeId(),
        label: String(record.label ?? "Untitled chapter"),
        pageIndex: Math.max(0, Number(record.pageIndex ?? 0) || 0),
      };
    })
    .filter((link): link is PageData["topicLinks"][number] => link !== null);
}

function normalizeDoc(input: unknown): BookDoc | null {
  if (!input || typeof input !== "object") return null;
  const obj = input as Record<string, unknown>;
  if (!Array.isArray(obj.pages) || obj.pages.length === 0) return null;
  const themeIn = (obj.theme ?? SAMPLE_BOOK.theme) as Partial<BookTheme>;
  const theme: BookTheme = {
    paper: String(themeIn.paper ?? SAMPLE_BOOK.theme.paper),
    ink: String(themeIn.ink ?? SAMPLE_BOOK.theme.ink),
    accent: String(themeIn.accent ?? SAMPLE_BOOK.theme.accent),
    font:
      themeIn.font === "serif" || themeIn.font === "sans" || themeIn.font === "display"
        ? themeIn.font
        : SAMPLE_BOOK.theme.font,
  };
  const pages = ensureTopicContextPage((obj.pages as Record<string, unknown>[]).map((p) =>
    blankPage({
      id: typeof p.id === "string" ? p.id : makeId(),
      variant: (p.variant as PageData["variant"]) ?? "text",
      title: String(p.title ?? ""),
      subtitle: String(p.subtitle ?? ""),
      body: String(p.body ?? ""),
      image: String(p.image ?? ""),
      images: Array.isArray(p.images)
        ? p.images.map(String).filter(Boolean)
        : p.image
        ? [String(p.image)]
        : [],
      imageLayout:
        p.imageLayout === "grid-3" ||
        p.imageLayout === "grid-4" ||
        p.imageLayout === "single"
          ? p.imageLayout
          : "side-by-side",
      popOutMedia: p.popOutMedia !== false,
      caption: String(p.caption ?? ""),
      bg: String(p.bg ?? ""),
      ink: String(p.ink ?? ""),
      accent: String(p.accent ?? ""),
      align: (p.align as PageData["align"]) ?? "left",
      font: (p.font as PageData["font"]) ?? "",
      pageNumber: p.pageNumber !== false,
      topicLinks: normalizeTopicLinks(p.topicLinks),
      gallery: normalizeGallery(p.gallery),
      video: String(p.video ?? ""),
      linkUrl: String(p.linkUrl ?? ""),
      linkLabel: String(p.linkLabel ?? ""),
      linkStyle:
        p.linkStyle === "secondary" ||
        p.linkStyle === "glass" ||
        p.linkStyle === "neon" ||
        p.linkStyle === "pill"
          ? p.linkStyle
          : "primary",
      linkIcon: (p.linkIcon as PageData["linkIcon"]) || "link",
      embedType:
        p.embedType === "map" ||
        p.embedType === "social" ||
        p.embedType === "custom"
          ? p.embedType
          : "none",
      embedUrl: String(p.embedUrl ?? ""),
      embedTitle: String(p.embedTitle ?? ""),
      layout: normalizeLayout(p.layout),
    })
  ));
  return {
    title: String(obj.title ?? "Untitled"),
    author: String(obj.author ?? ""),
    theme,
    pages,
  };
}

function flippedForPage(i: number): number {
  return i % 2 === 0 ? i / 2 : (i + 1) / 2;
}

// Page counter removed per user request

export default function App() {
  const [doc, setDoc] = useState<BookDoc>(loadDoc);
  const [selected, setSelected] = useState(0);
  const [flipped, setFlipped] = useState(0);
  const [busy, setBusy] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [present, setPresent] = useState(false);

  const numSheets = Math.max(1, Math.ceil(doc.pages.length / 2));
  const navLock = useRef(false);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(doc));
    } catch {
      /* ignore */
    }
  }, [doc]);

  // clamp selection & flip when page count changes
  useEffect(() => {
    setSelected((s) => Math.min(s, doc.pages.length - 1));
  }, [doc.pages.length]);
  useEffect(() => {
    setFlipped((f) => Math.max(0, Math.min(numSheets, f)));
  }, [numSheets]);

  // sync selected index with flipped sheet changes
  useEffect(() => {
    if (flipped === 0) {
      setSelected(0);
    } else {
      const idx = 2 * flipped - 1; // default to left page
      if (idx < doc.pages.length) {
        if (flippedForPage(selected) !== flipped) {
          setSelected(idx);
        }
      }
    }
  }, [flipped, doc.pages.length, selected]);

  const goTo = useCallback(
    (next: number) => {
      const clamped = Math.max(0, Math.min(numSheets, next));
      // A very short debounce protects against genuine double-fires (e.g. touch
      // + click events) while still letting the reader flip quickly.
      if (navLock.current) return;
      setFlipped((f) => {
        if (f === clamped) return f;
        navLock.current = true;
        window.setTimeout(() => (navLock.current = false), 120);
        return clamped;
      });
    },
    [numSheets]
  );

  const next = useCallback(() => goTo(flipped + 1), [flipped, goTo]);
  const prev = useCallback(() => goTo(flipped - 1), [flipped, goTo]);

  const nextSingle = useCallback(() => {
    setSelected((s) => {
      const nextIdx = Math.min(doc.pages.length - 1, s + 1);
      setFlipped(flippedForPage(nextIdx));
      return nextIdx;
    });
  }, [doc.pages.length]);

  const prevSingle = useCallback(() => {
    setSelected((s) => {
      const prevIdx = Math.max(0, s - 1);
      setFlipped(flippedForPage(prevIdx));
      return prevIdx;
    });
  }, []);

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing =
        t &&
        (t.tagName === "INPUT" ||
          t.tagName === "TEXTAREA" ||
          t.isContentEditable);
      if (e.key === "Escape") {
        setPresent(false);
        setEditorOpen(false);
        return;
      }
      if (typing) return;
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (present) {
          nextSingle();
        } else {
          next();
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (present) {
          prevSingle();
        } else {
          prev();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, nextSingle, prevSingle, present]);

  // ---- doc mutations ----
  const updatePage = useCallback((i: number, patch: Partial<PageData>) => {
    setDoc((d) => {
      const pages = d.pages.slice();
      pages[i] = { ...pages[i], ...patch };
      return { ...d, pages };
    });
  }, []);

  const updateDoc = useCallback((patch: Partial<BookDoc>) => {
    setDoc((d) => ({ ...d, ...patch }));
  }, []);

  const updateTheme = useCallback((patch: Partial<BookTheme>) => {
    setDoc((d) => ({ ...d, theme: { ...d.theme, ...patch } }));
  }, []);

  const addPage = useCallback((after: number) => {
    setDoc((d) => {
      const pages = d.pages.slice();
      const np = blankPage({ font: "" });
      pages.splice(after + 1, 0, np);
      return { ...d, pages };
    });
    setSelected(after + 1);
  }, []);

  const duplicatePage = useCallback((i: number) => {
    setDoc((d) => {
      const pages = d.pages.slice();
      const copy = { ...pages[i], id: makeId() };
      pages.splice(i + 1, 0, copy);
      return { ...d, pages };
    });
    setSelected(i + 1);
  }, []);

  const deletePage = useCallback((i: number) => {
    setDoc((d) => {
      if (d.pages.length <= 1) return d;
      const pages = d.pages.slice();
      pages.splice(i, 1);
      return { ...d, pages };
    });
    setSelected((s) => {
      if (i < s) return s - 1;
      if (i === s) return Math.max(0, s - 1);
      return s;
    });
  }, []);

  const movePage = useCallback((i: number, dir: -1 | 1) => {
    setDoc((d) => {
      const j = i + dir;
      if (j < 0 || j >= d.pages.length) return d;
      const pages = d.pages.slice();
      const [moved] = pages.splice(i, 1);
      pages.splice(j, 0, moved);
      return { ...d, pages };
    });
    setSelected(i + dir);
  }, []);

  const applyPreset = useCallback((theme: BookTheme) => {
    setDoc((d) => ({ ...d, theme }));
  }, []);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(doc, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.title.replace(/\s+/g, "-").toLowerCase() || "book"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [doc]);

  const handleImport = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const normalized = normalizeDoc(parsed);
        if (normalized) {
          setDoc(normalized);
          setSelected(0);
          setFlipped(0);
        }
      } catch {
        /* ignore */
      }
    };
    reader.readAsText(file);
  }, []);

  const handleReset = useCallback(() => {
    const fresh = cloneDoc(SAMPLE_BOOK);
    setDoc(fresh);
    setSelected(0);
    setFlipped(0);
  }, []);

  const selectPage = useCallback(
    (i: number) => {
      setSelected(i);
      setFlipped(Math.max(0, Math.min(numSheets, flippedForPage(i))));
      setEditorOpen(false);
    },
    [numSheets]
  );

  // progress bar removed per user request

  const editorNode = (
    <Editor
      doc={doc}
      selected={selected}
      onSelect={selectPage}
      onClose={() => setEditorOpen(false)}
      onUpdatePage={updatePage}
      onUpdateDoc={updateDoc}
      onUpdateTheme={updateTheme}
      onAddPage={addPage}
      onDuplicatePage={duplicatePage}
      onDeletePage={deletePage}
      onMovePage={movePage}
      onApplyPreset={applyPreset}
      onExport={handleExport}
      onImport={handleImport}
      onReset={handleReset}
    />
  );

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#070a14] text-slate-200">
      {/* Header */}
      {!present && (
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-slate-950/50 px-4 py-3 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-indigo-900/40">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div className="leading-tight">
              <h1 className="text-sm font-semibold text-white sm:text-base">
                Flipbook Studio
              </h1>
              <p className="hidden text-[11px] text-slate-500 sm:block">
                {doc.title}
                {doc.author ? ` · ${doc.author}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] text-slate-400 md:flex">
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-sans text-[10px]">←</kbd>
              <kbd className="rounded bg-white/10 px-1.5 py-0.5 font-sans text-[10px]">→</kbd>
              turn pages
            </span>
            <button
              onClick={() => setPresent(true)}
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-white/10"
            >
              <Expand className="h-4 w-4" />
              <span className="hidden sm:inline">Present</span>
            </button>
            <button
              onClick={() => setEditorOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-400 lg:hidden"
            >
              Editor
            </button>
          </div>
        </header>
      )}

      {/* Main */}
      <main className="relative flex min-h-0 flex-1">
        {/* Stage */}
        <div className="relative flex min-w-0 flex-1 flex-col">
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-violet-700/20 blur-[120px]" />
            <div className="absolute -right-24 bottom-1/4 h-96 w-96 rounded-full bg-indigo-700/20 blur-[120px]" />
            <div className="absolute left-1/2 top-1/2 h-[40rem] w-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fuchsia-700/5 blur-[140px]" />
          </div>

          <div className="relative min-h-0 flex-1 px-4 py-6 sm:px-8 sm:py-10">
            <Flipbook
              pages={doc.pages}
              theme={doc.theme}
              flipped={flipped}
              onFlip={goTo}
              onAnimatingChange={setBusy}
            />
          </div>

          {/* Bottom navigation */}
          <div className="relative z-10 flex shrink-0 items-center justify-center gap-4 px-4 pb-5">
            <NavBtn onClick={prev} disabled={busy || flipped <= 0} label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </NavBtn>

            <div className="flex min-w-[150px] flex-col items-center gap-2" />

            <NavBtn onClick={next} disabled={busy || flipped >= numSheets} label="Next">
              <ChevronRight className="h-5 w-5" />
            </NavBtn>
          </div>

        </div>

        {/* Editor — persistent on large screens, drawer on small */}
        {!present && (
          <>
            {editorOpen && (
              <div
                className="absolute inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
                onClick={() => setEditorOpen(false)}
              />
            )}
            <div
              className={cn(
                "z-40",
                "max-lg:absolute max-lg:inset-y-0 max-lg:right-0 max-lg:w-[90%] max-lg:max-w-sm max-lg:shadow-2xl max-lg:transition-transform max-lg:duration-300",
                editorOpen ? "max-lg:translate-x-0" : "max-lg:translate-x-full",
                "lg:static lg:w-[380px] lg:translate-x-0"
              )}
            >
              {editorNode}
            </div>
          </>
        )}
      </main>

      {/* Fullscreen Single Page Presentation Mode Overlay */}
      {present && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-[#05070f] p-6 select-none animate-float-up">
          {/* Background Glow */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-violet-800/15 blur-[130px] animate-glow" />
            <div className="absolute right-1/4 bottom-1/4 h-96 w-96 rounded-full bg-indigo-800/15 blur-[130px] animate-glow" />
          </div>

          {/* Top Bar */}
          <div className="relative z-10 flex w-full max-w-5xl items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Presentation Mode</span>
              <span className="text-sm font-semibold text-slate-200">{doc.title}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-300 font-mono bg-white/5 border border-white/10 rounded-full px-3 py-1">
                Page {selected + 1}
              </span>
              <button
                onClick={() => setPresent(false)}
                className="flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition cursor-pointer"
              >
                <X className="h-4 w-4" /> Exit (Esc)
              </button>
            </div>
          </div>

          {/* Center Page Display */}
          <div className="relative z-10 flex flex-1 items-center justify-center py-6 w-full gap-8">
            <button
              onClick={prevSingle}
              disabled={selected <= 0}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-slate-300 hover:scale-105 hover:bg-slate-800 hover:text-white transition duration-200 disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>

            {/* Actual Single Page Container */}
            <div 
              className="relative overflow-hidden rounded-2xl shadow-[0_24px_50px_-12px_rgba(0,0,0,0.8)] border border-white/5 bg-slate-900"
              style={{
                width: "90vw",
                height: "75vh",
                maxWidth: "calc(75vh * 0.7)", // enforce the aspect ratio
                maxHeight: "calc(90vw / 0.7)",
              }}
            >
              <PageView page={doc.pages[selected]} theme={doc.theme} pageNumber={selected + 1} />
            </div>

            <button
              onClick={nextSingle}
              disabled={selected >= doc.pages.length - 1}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-slate-900/60 text-slate-300 hover:scale-105 hover:bg-slate-800 hover:text-white transition duration-200 disabled:pointer-events-none disabled:opacity-20 cursor-pointer"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>

          {/* Bottom Dot Indicator track */}
          <div className="relative z-10 flex w-full max-w-xl flex-col items-center gap-4 pb-2">
            <div className="flex gap-1.5 flex-wrap justify-center px-4">
              {doc.pages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelected(idx);
                    setFlipped(flippedForPage(idx));
                  }}
                  className={`h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                    selected === idx ? "w-7 bg-violet-400" : "w-2.5 bg-white/20 hover:bg-white/40"
                  }`}
                  title={`Go to page ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavBtn({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-full border text-slate-200 transition",
        disabled
          ? "cursor-not-allowed border-white/5 text-slate-600"
          : "border-white/15 bg-white/5 hover:scale-105 hover:border-violet-400/60 hover:bg-violet-500/20 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}
