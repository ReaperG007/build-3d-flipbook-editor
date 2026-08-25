import { useRef, type ReactNode } from "react";
import {
  BUTTON_ICONS,
  type BookDoc,
  type BookTheme,
  type ButtonIconKey,
  FONT_LABELS,
  type GalleryItem,
  type ImageLayout,
  makeId,
  type FontKey,
  type PageData,
  type PageVariant,
  type TopicLink,
  THEME_PRESETS,
  VARIANT_LABELS,
} from "../types";
import { cn } from "../utils/cn";
import Thumbnail from "./Thumbnail";
import PageMapper from "./PageMapper";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Copy,
  DiscordIcon,
  Download,
  ExternalLink,
  FacebookIcon,
  GitHubIcon,
  Globe,
  Image as ImageIcon,
  InstagramIcon,
  Layers,
  LinkedInIcon,
  LinkIcon,
  MailIcon,
  MapPin,
  Palette,
  PhoneIcon,
  Plus,
  RotateCcw,
  Settings,
  Share2,
  SpotifyIcon,
  TelegramIcon,
  ThreadsIcon,
  TikTokIcon,
  Trash,
  Type,
  Upload,
  Video,
  WhatsAppIcon,
  X,
  XTwitterIcon,
  YouTubeIcon,
} from "./icons";

interface EditorProps {
  doc: BookDoc;
  selected: number;
  onSelect: (i: number) => void;
  onClose?: () => void;
  onUpdatePage: (i: number, patch: Partial<PageData>) => void;
  onUpdateDoc: (patch: Partial<BookDoc>) => void;
  onUpdateTheme: (patch: Partial<BookTheme>) => void;
  onAddPage: (i: number) => void;
  onDuplicatePage: (i: number) => void;
  onDeletePage: (i: number) => void;
  onMovePage: (i: number, dir: -1 | 1) => void;
  onApplyPreset: (theme: BookTheme) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onReset: () => void;
}

const GRADIENTS = [
  "linear-gradient(135deg,#fdfbfb,#ebedee)",
  "linear-gradient(160deg,#0f2027,#203a43,#2c5364)",
  "linear-gradient(160deg,#2b5876,#4e4376)",
  "linear-gradient(160deg,#1f1c2c,#9289ab)",
  "linear-gradient(160deg,#ee9ca7,#ffdde1)",
  "linear-gradient(160deg,#2c3e50,#4ca1af)",
];

const isHex = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());

function EditorBrandIcon({ iconKey }: { iconKey: ButtonIconKey }) {
  switch (iconKey) {
    case "whatsapp":
      return <WhatsAppIcon className="h-3.5 w-3.5" />;
    case "instagram":
      return <InstagramIcon className="h-3.5 w-3.5" />;
    case "facebook":
      return <FacebookIcon className="h-3.5 w-3.5" />;
    case "x":
      return <XTwitterIcon className="h-3.5 w-3.5" />;
    case "telegram":
      return <TelegramIcon className="h-3.5 w-3.5" />;
    case "youtube":
      return <YouTubeIcon className="h-3.5 w-3.5" />;
    case "tiktok":
      return <TikTokIcon className="h-3.5 w-3.5" />;
    case "discord":
      return <DiscordIcon className="h-3.5 w-3.5" />;
    case "linkedin":
      return <LinkedInIcon className="h-3.5 w-3.5" />;
    case "spotify":
      return <SpotifyIcon className="h-3.5 w-3.5" />;
    case "threads":
      return <ThreadsIcon className="h-3.5 w-3.5" />;
    case "github":
      return <GitHubIcon className="h-3.5 w-3.5" />;
    case "mail":
      return <MailIcon className="h-3.5 w-3.5" />;
    case "phone":
      return <PhoneIcon className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

export default function Editor(props: EditorProps) {
  const {
    doc,
    selected,
    onSelect,
    onClose,
    onUpdatePage,
    onUpdateDoc,
    onUpdateTheme,
    onAddPage,
    onDuplicatePage,
    onDeletePage,
    onMovePage,
    onApplyPreset,
    onExport,
    onImport,
    onReset,
  } = props;

  const page = doc.pages[selected];
  const theme = doc.theme;
  const imgInput = useRef<HTMLInputElement>(null);
  const jsonInput = useRef<HTMLInputElement>(null);

  const chapterOptions = doc.pages
    .map((p, i) => ({ page: p, index: i }))
    .filter(({ page: candidate }) => candidate.variant === "chapter");

  const commitTopicLinks = (links: TopicLink[]) => {
    onUpdatePage(selected, {
      topicLinks: links,
      body: links.map((link) => link.label).join("\n"),
    });
  };

  const addTopicLink = () => {
    const firstChapter = chapterOptions[0];
    const next: TopicLink = {
      id: makeId(),
      label: firstChapter?.page.title || "Untitled chapter",
      pageIndex: firstChapter?.index ?? 0,
    };
    commitTopicLinks([...(page?.topicLinks ?? []), next]);
  };

  const updateTopicLink = (linkId: string, patch: Partial<TopicLink>) => {
    commitTopicLinks(
      (page?.topicLinks ?? []).map((link) =>
        link.id === linkId ? { ...link, ...patch } : link
      )
    );
  };

  const removeTopicLink = (linkId: string) => {
    commitTopicLinks((page?.topicLinks ?? []).filter((link) => link.id !== linkId));
  };

  return (
    <aside className="fancy-scroll flex h-full w-full flex-col overflow-y-auto border-l border-white/10 bg-slate-950/60 backdrop-blur-xl">
      {/* header */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-slate-950/80 px-5 py-4 backdrop-blur">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5 text-violet-400" />
          <h2 className="text-sm font-semibold tracking-wide text-slate-100">
            Editor
          </h2>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-6 px-5 py-5">
        {/* ---------- PAGES ---------- */}
        <Section icon={<Layers className="h-4 w-4" />} title="Pages">
          <div className="fancy-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-2">
            {doc.pages.map((p, i) => (
              <Thumbnail
                key={p.id}
                page={p}
                theme={theme}
                index={i}
                width={72}
                selected={i === selected}
                onSelect={() => onSelect(i)}
              />
            ))}
            <button
              onClick={() => onAddPage(selected)}
              className="flex w-[60px] shrink-0 flex-col items-center justify-center gap-1 rounded-md border border-dashed border-white/15 text-slate-400 transition hover:border-violet-400/60 hover:text-violet-300"
              style={{ height: Math.round(72 / 0.7) }}
              title="Add page after current"
            >
              <Plus className="h-5 w-5" />
              <span className="text-[10px]">Add</span>
            </button>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <ActionBtn onClick={() => onAddPage(selected)} icon={<Plus className="h-4 w-4" />}>
              Add
            </ActionBtn>
            <ActionBtn onClick={() => onDuplicatePage(selected)} icon={<Copy className="h-4 w-4" />}>
              Duplicate
            </ActionBtn>
            <ActionBtn onClick={() => onMovePage(selected, -1)} disabled={selected <= 0}>
              ← Move
            </ActionBtn>
            <ActionBtn
              onClick={() => onMovePage(selected, 1)}
              disabled={selected >= doc.pages.length - 1}
            >
              Move →
            </ActionBtn>
            <ActionBtn
              onClick={() => onDeletePage(selected)}
              disabled={doc.pages.length <= 1}
              danger
              icon={<Trash className="h-4 w-4" />}
            >
              Delete
            </ActionBtn>
          </div>
        </Section>

        {/* ---------- PAGE CONTENT ---------- */}
        {page && (
          <>
            <Section icon={<Type className="h-4 w-4" />} title="Page Content">
              <Field label="Layout">
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(VARIANT_LABELS) as PageVariant[]).map((v) => (
                    <Chip
                      key={v}
                      active={page.variant === v}
                      onClick={() => onUpdatePage(selected, { variant: v })}
                    >
                      {VARIANT_LABELS[v]}
                    </Chip>
                  ))}
                </div>
              </Field>

              {page.variant !== "blank" && (
                <Field
                  label={
                    page.variant === "quote"
                      ? "Quote text"
                      : page.variant === "cover"
                      ? "Book title"
                      : "Heading"
                  }
                >
                  <TextInput
                    value={page.title}
                    onChange={(v) => onUpdatePage(selected, { title: v })}
                    placeholder={page.variant === "quote" ? "Write a quote…" : "Heading"}
                  />
                </Field>
              )}

              {page.variant !== "blank" &&
                page.variant !== "text" &&
                page.variant !== "image" && (
                  <Field
                    label={
                      page.variant === "quote"
                        ? "Attribution"
                        : page.variant === "cover"
                        ? "Kicker / series"
                        : "Kicker / subtitle"
                    }
                  >
                    <TextInput
                      value={page.subtitle}
                      onChange={(v) => onUpdatePage(selected, { subtitle: v })}
                      placeholder="e.g. Chapter One"
                    />
                  </Field>
                )}

              {(page.variant === "text" ||
                page.variant === "topics" ||
                page.variant === "chapter" ||
                page.variant === "cover") && (
                <Field
                  label={
                    page.variant === "cover"
                      ? "Tagline / byline"
                      : page.variant === "topics"
                      ? "Topic list"
                      : "Body"
                  }
                  hint={
                    page.variant === "topics"
                      ? "One topic per line"
                      : "Blank line starts a new paragraph"
                  }
                >
                  <TextArea
                    value={page.body}
                    onChange={(v) => onUpdatePage(selected, { body: v })}
                    rows={page.variant === "cover" ? 2 : 6}
                    placeholder="Write your story…"
                  />
                </Field>
              )}

              {page.variant === "topics" && (
                <Field
                  label="Chapter links"
                  hint="Select chapter and first page"
                >
                  <div className="flex flex-col gap-2">
                    {(page.topicLinks.length > 0 ? page.topicLinks : []).map(
                      (link) => (
                        <div
                          key={link.id}
                          className="grid grid-cols-[1fr_70px_auto] gap-2 rounded-lg border border-white/10 bg-slate-900/40 p-2"
                        >
                          <select
                            value={link.pageIndex}
                            onChange={(e) => {
                              const pageIndex = Number(e.target.value);
                              const chapter = doc.pages[pageIndex];
                              updateTopicLink(link.id, {
                                pageIndex,
                                label:
                                  chapter?.title ||
                                  `Page ${pageIndex + 1}`,
                              });
                            }}
                            className="min-w-0 rounded-md border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-violet-400/60"
                          >
                            {chapterOptions.map(({ page: chapter, index }) => (
                              <option
                                key={chapter.id}
                                value={index}
                                className="bg-slate-950"
                              >
                                {chapter.title || `Chapter page ${index + 1}`}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={1}
                            max={doc.pages.length}
                            value={link.pageIndex + 1}
                            onChange={(e) => {
                              const pageIndex = Math.max(
                                0,
                                Math.min(
                                  doc.pages.length - 1,
                                  Number(e.target.value) - 1
                                )
                              );
                              updateTopicLink(link.id, {
                                pageIndex,
                                label:
                                  doc.pages[pageIndex]?.title ||
                                  `Page ${pageIndex + 1}`,
                              });
                            }}
                            className="rounded-md border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-violet-400/60"
                            title="First page number"
                          />
                          <button
                            onClick={() => removeTopicLink(link.id)}
                            className="rounded-md px-2 text-xs text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                    <button
                      onClick={addTopicLink}
                      disabled={chapterOptions.length === 0}
                      className="rounded-lg border border-dashed border-white/15 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-violet-400/60 hover:text-violet-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Add chapter link
                    </button>
                    {chapterOptions.length === 0 && (
                      <p className="text-[11px] text-slate-500">
                        Add a Chapter layout page before creating links.
                      </p>
                    )}
                  </div>
                </Field>
              )}

              {(page.variant === "cover" ||
                page.variant === "image" ||
                page.variant === "quote") && (
                <Field
                  label={
                    page.variant === "image"
                      ? "Images (Single or Side-by-Side)"
                      : "Background image"
                  }
                  hint={
                    page.variant === "image"
                      ? "Add multiple images to display side-by-side"
                      : undefined
                  }
                >
                  {page.variant === "image" ? (
                    <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-slate-900/40 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          Display Layout:
                        </span>
                        <div className="flex gap-1">
                          {[
                            { key: "side-by-side", label: "Side-by-Side (2)" },
                            { key: "grid-3", label: "3 Cols" },
                            { key: "grid-4", label: "4 Grid" },
                            { key: "single", label: "Single" },
                          ].map((mode) => (
                            <button
                              key={mode.key}
                              type="button"
                              onClick={() =>
                                onUpdatePage(selected, {
                                  imageLayout: mode.key as ImageLayout,
                                })
                              }
                              className={cn(
                                "rounded px-2 py-0.5 text-[10px] font-medium transition",
                                (page.imageLayout || "side-by-side") === mode.key
                                  ? "bg-violet-500 text-white"
                                  : "bg-white/5 text-slate-300 hover:bg-white/10"
                              )}
                            >
                              {mode.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Image List */}
                      <div className="flex flex-col gap-1.5">
                        {(page.images && page.images.length > 0
                          ? page.images
                          : page.image
                          ? [page.image]
                          : []
                        ).map((url, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-1.5 rounded border border-white/10 bg-slate-950/60 p-1.5"
                          >
                            <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-slate-900">
                              <img
                                src={url}
                                alt=""
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <input
                              value={url.startsWith("data:") ? "[Uploaded Image]" : url}
                              onChange={(e) => {
                                const nextList = [
                                  ...(page.images && page.images.length > 0
                                    ? page.images
                                    : page.image
                                    ? [page.image]
                                    : []),
                                ];
                                nextList[idx] = e.target.value;
                                onUpdatePage(selected, {
                                  images: nextList,
                                  image: nextList[0] || "",
                                });
                              }}
                              placeholder="Image URL..."
                              className="w-full min-w-0 rounded bg-transparent px-1 text-xs text-slate-100 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                const nextList = (
                                  page.images && page.images.length > 0
                                    ? page.images
                                    : page.image
                                    ? [page.image]
                                    : []
                                ).filter((_, i) => i !== idx);
                                onUpdatePage(selected, {
                                  images: nextList,
                                  image: nextList[0] || "",
                                });
                              }}
                              className="px-1 text-xs text-slate-400 hover:text-rose-300"
                              title="Remove this image"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => imgInput.current?.click()}
                          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-200 transition hover:bg-white/10"
                        >
                          <Upload className="h-3.5 w-3.5" /> Upload File
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const current =
                              page.images && page.images.length > 0
                                ? page.images
                                : page.image
                                ? [page.image]
                                : [];
                            const nextList = [...current, ""];
                            onUpdatePage(selected, {
                              images: nextList,
                              image: nextList[0] || "",
                            });
                          }}
                          className="flex items-center gap-1 rounded-md border border-dashed border-white/15 px-2 py-1 text-xs text-slate-300 hover:border-violet-400/60"
                        >
                          <Plus className="h-3.5 w-3.5" /> Add URL
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <TextInput
                        value={page.image.startsWith("data:") ? "" : page.image}
                        onChange={(v) => onUpdatePage(selected, { image: v })}
                        placeholder="Paste image URL…"
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          onClick={() => imgInput.current?.click()}
                          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
                        >
                          <Upload className="h-3.5 w-3.5" /> Upload
                        </button>
                        {page.image && (
                          <>
                            <button
                              onClick={() => onUpdatePage(selected, { image: "" })}
                              className="rounded-md px-2 py-1.5 text-xs text-slate-400 transition hover:text-rose-300"
                            >
                              Remove
                            </button>
                            <span className="flex items-center gap-1 text-[11px] text-emerald-300">
                              <ImageIcon className="h-3.5 w-3.5" /> set
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                  <input
                    ref={imgInput}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          const current =
                            page.images && page.images.length > 0
                              ? page.images
                              : page.image
                              ? [page.image]
                              : [];
                          const nextList = [...current, reader.result];
                          onUpdatePage(selected, {
                            images: nextList,
                            image: nextList[0] || reader.result,
                          });
                        }
                      };
                      reader.readAsDataURL(file);
                      e.target.value = "";
                    }}
                  />
                </Field>
              )}

              {page.variant === "image" && (
                <Field label="Caption">
                  <TextInput
                    value={page.caption}
                    onChange={(v) => onUpdatePage(selected, { caption: v })}
                    placeholder="Caption text…"
                  />
                </Field>
              )}

              {page.variant === "gallery" && (
                <Field
                  label="Image gallery & page mapping"
                  hint="Each image is mapped to a page number"
                >
                  <GalleryEditor
                    items={page.gallery}
                    totalPages={doc.pages.length}
                    onChange={(gallery) =>
                      onUpdatePage(selected, { gallery })
                    }
                  />
                </Field>
              )}

              {page.variant !== "blank" && (
                <Field
                  label="Page mapper"
                  hint="Place text, image & video blocks anywhere on the page"
                >
                  <PageMapper
                    page={page}
                    theme={theme}
                    onUpdatePage={(patch) => onUpdatePage(selected, patch)}
                  />
                </Field>
              )}

              {page.variant !== "blank" && (
                <Field
                  label="Video link"
                  hint="Direct URL, YouTube, Vimeo, Loom, mp4"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/15 bg-slate-900/60 text-violet-300">
                      <Video className="h-4 w-4" />
                    </div>
                    <input
                      value={page.video}
                      onChange={(e) =>
                        onUpdatePage(selected, { video: e.target.value })
                      }
                      placeholder="https://youtube.com/watch?v=… or .mp4"
                      className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs text-slate-100 outline-none focus:border-violet-400/60"
                    />
                  </div>
                  {page.video && (
                    <div className="mt-1.5 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400">
                        ✓ Video embed ready
                      </span>
                      <button
                        onClick={() => onUpdatePage(selected, { video: "" })}
                        className="rounded-md px-2 py-0.5 text-[11px] text-slate-400 transition hover:text-rose-300"
                      >
                        Remove video
                      </button>
                    </div>
                  )}
                </Field>
              )}

              {page.variant !== "blank" && (
                <Field
                  label="Link Embed (3D Action Button)"
                  hint="Tactile 3D clickable button"
                >
                  <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-slate-900/40 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/15 bg-violet-500/20 text-violet-300">
                        <LinkIcon className="h-4 w-4" />
                      </div>
                      <input
                        value={page.linkUrl}
                        onChange={(e) =>
                          onUpdatePage(selected, { linkUrl: e.target.value })
                        }
                        placeholder="Destination URL (https://…)"
                        className="w-full rounded-md border border-white/10 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-violet-400/60"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="mb-1 block text-[10px] text-slate-400">
                          Button Text
                        </span>
                        <input
                          value={page.linkLabel}
                          onChange={(e) =>
                            onUpdatePage(selected, { linkLabel: e.target.value })
                          }
                          placeholder="e.g. ✦ Explore Project"
                          className="w-full rounded-md border border-white/10 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-violet-400/60"
                        />
                      </div>
                      <div>
                        <span className="mb-1 block text-[10px] text-slate-400">
                          3D Appearance
                        </span>
                        <select
                          value={page.linkStyle || "primary"}
                          onChange={(e) =>
                            onUpdatePage(selected, {
                              linkStyle: e.target.value as PageData["linkStyle"],
                            })
                          }
                          className="w-full rounded-md border border-white/10 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-violet-400/60"
                        >
                          <option value="primary">Primary Accent</option>
                          <option value="secondary">Dark Bevel</option>
                          <option value="glass">Glass Reflection</option>
                          <option value="neon">Neon Cyan</option>
                          <option value="pill">Rounded Pill</option>
                        </select>
                      </div>
                    </div>

                    {/* 3D Icon Option Selector */}
                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <span className="text-[10px] font-semibold text-slate-300">
                          3D Social & Media Icon
                        </span>
                        <span className="text-[9px] text-violet-300 font-mono">
                          {BUTTON_ICONS.find((i) => i.key === (page.linkIcon || "link"))?.label}
                        </span>
                      </div>

                      {/* Social Media Group */}
                      <div className="mb-2">
                        <span className="mb-1 block text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                          Social Media
                        </span>
                        <div className="grid grid-cols-7 gap-1">
                          {BUTTON_ICONS.filter((i) => i.category === "social").map((btnIcon) => (
                            <button
                              key={btnIcon.key}
                              type="button"
                              onClick={() =>
                                onUpdatePage(selected, { linkIcon: btnIcon.key })
                              }
                              className={cn(
                                "flex flex-col items-center justify-center rounded p-1.5 text-xs transition",
                                (page.linkIcon || "link") === btnIcon.key
                                  ? "bg-violet-500 text-white shadow-lg shadow-violet-900/50 ring-1 ring-white/30"
                                  : "bg-white/5 text-slate-300 hover:bg-white/10"
                              )}
                              title={btnIcon.label}
                            >
                              <div className="flex h-4 w-4 items-center justify-center">
                                <EditorBrandIcon iconKey={btnIcon.key} />
                              </div>
                              <span className="mt-0.5 text-[8px] truncate max-w-full font-mono">
                                {btnIcon.label.split(" ")[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* General 3D Icons Group */}
                      <div>
                        <span className="mb-1 block text-[9px] uppercase tracking-wider text-slate-500 font-bold">
                          3D Symbols
                        </span>
                        <div className="grid grid-cols-6 gap-1">
                          {BUTTON_ICONS.filter((i) => i.category === "general").map((btnIcon) => (
                            <button
                              key={btnIcon.key}
                              type="button"
                              onClick={() =>
                                onUpdatePage(selected, { linkIcon: btnIcon.key })
                              }
                              className={cn(
                                "flex flex-col items-center justify-center rounded p-1.5 text-xs transition",
                                (page.linkIcon || "link") === btnIcon.key
                                  ? "bg-violet-500 text-white shadow-lg shadow-violet-900/50 ring-1 ring-white/30"
                                  : "bg-white/5 text-slate-300 hover:bg-white/10"
                              )}
                              title={btnIcon.label}
                            >
                              <span className="text-sm">{btnIcon.icon}</span>
                              <span className="mt-0.5 text-[8px] truncate max-w-full font-mono">
                                {btnIcon.label.split(" ")[0]}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {page.linkUrl && (
                      <div className="flex items-center justify-between pt-1">
                        <a
                          href={
                            /^https?:\/\//i.test(page.linkUrl)
                              ? page.linkUrl
                              : `https://${page.linkUrl}`
                          }
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-[11px] text-violet-300 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> Test Link
                        </a>
                        <button
                          onClick={() =>
                            onUpdatePage(selected, {
                              linkUrl: "",
                              linkLabel: "",
                            })
                          }
                          className="text-[11px] text-slate-400 hover:text-rose-300"
                        >
                          Clear Button
                        </button>
                      </div>
                    )}
                  </div>
                </Field>
              )}

              {page.variant !== "blank" && (
                <Field
                  label="Iframe Embed Space (Map & Social)"
                  hint="Embed live map, tweet, Spotify, CodePen, or widget"
                >
                  <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-slate-900/40 p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="mb-1 block text-[10px] text-slate-400">
                          Embed Type
                        </span>
                        <select
                          value={page.embedType || "none"}
                          onChange={(e) =>
                            onUpdatePage(selected, {
                              embedType: e.target.value as PageData["embedType"],
                            })
                          }
                          className="w-full rounded-md border border-white/10 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-violet-400/60"
                        >
                          <option value="none">None (Disabled)</option>
                          <option value="map">🗺️ Interactive Map</option>
                          <option value="social">💬 Social Card / Music</option>
                          <option value="custom">🌐 Custom Web Widget</option>
                        </select>
                      </div>
                      <div>
                        <span className="mb-1 block text-[10px] text-slate-400">
                          Embed Title
                        </span>
                        <input
                          value={page.embedTitle}
                          onChange={(e) =>
                            onUpdatePage(selected, { embedTitle: e.target.value })
                          }
                          placeholder="e.g. Location Map"
                          className="w-full rounded-md border border-white/10 bg-slate-950/60 px-2.5 py-1.5 text-xs text-slate-100 outline-none focus:border-violet-400/60"
                        />
                      </div>
                    </div>

                    {page.embedType !== "none" && (
                      <>
                        <div>
                          <span className="mb-1 block text-[10px] text-slate-400">
                            Iframe Snippet or Direct URL
                          </span>
                          <textarea
                            value={page.embedUrl}
                            onChange={(e) =>
                              onUpdatePage(selected, { embedUrl: e.target.value })
                            }
                            rows={3}
                            placeholder="Paste <iframe src='...'> or URL (OpenStreetMap, Spotify, Google Maps, Figma, CodePen...)"
                            className="fancy-scroll w-full rounded-md border border-white/10 bg-slate-950/60 px-2.5 py-1.5 font-mono text-xs text-slate-100 outline-none focus:border-violet-400/60"
                          />
                        </div>

                        {/* Quick Presets for 1-click testing */}
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[10px] text-slate-500">
                            Presets:
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdatePage(selected, {
                                embedType: "map",
                                embedTitle: "Pacific Coastline Map",
                                embedUrl:
                                  "https://www.openstreetmap.org/export/embed.html?bbox=-122.53%2C37.74%2C-122.45%2C37.82&layer=mapnik",
                              })
                            }
                            className="flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-white/10"
                          >
                            <MapPin className="h-3 w-3 text-emerald-400" /> Map
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdatePage(selected, {
                                embedType: "social",
                                embedTitle: "Spotify Soundtrack",
                                embedUrl:
                                  "https://open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT",
                              })
                            }
                            className="flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-white/10"
                          >
                            <Share2 className="h-3 w-3 text-violet-400" /> Spotify
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdatePage(selected, {
                                embedType: "custom",
                                embedTitle: "CodePen 3D Shader",
                                embedUrl:
                                  "https://codepen.io/georgedoescode/embed/gOGzMZd?default-tab=result",
                              })
                            }
                            className="flex items-center gap-1 rounded bg-white/5 px-2 py-0.5 text-[10px] text-slate-300 hover:bg-white/10"
                          >
                            <Globe className="h-3 w-3 text-cyan-400" /> CodePen
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </Field>
              )}

              {page.variant !== "cover" && page.variant !== "blank" && (
                <Field label="Alignment">
                  <Segmented
                    value={page.align}
                    options={[
                      { value: "left", icon: <AlignLeft className="h-4 w-4" /> },
                      { value: "center", icon: <AlignCenter className="h-4 w-4" /> },
                      { value: "right", icon: <AlignRight className="h-4 w-4" /> },
                    ]}
                    onChange={(v) => onUpdatePage(selected, { align: v as PageData["align"] })}
                  />
                </Field>
              )}

              {page.variant !== "cover" && page.variant !== "blank" && (
                <Field label="Options">
                  <Toggle
                    label="Show page number"
                    checked={page.pageNumber}
                    onChange={(v) => onUpdatePage(selected, { pageNumber: v })}
                  />
                </Field>
              )}
            </Section>

            {/* ---------- PAGE STYLE ---------- */}
            <Section icon={<Palette className="h-4 w-4" />} title="Page Style">
              <Field label="Background" hint="Empty = theme paper">
                <div className="flex items-center gap-2">
                  <ColorRaw
                    value={isHex(page.bg) ? page.bg : theme.paper}
                    onChange={(c) => onUpdatePage(selected, { bg: c })}
                  />
                  {page.bg && (
                    <button
                      onClick={() => onUpdatePage(selected, { bg: "" })}
                      className="rounded-md px-2 py-1.5 text-xs text-slate-400 transition hover:text-rose-300"
                    >
                      Reset
                    </button>
                  )}
                </div>
                <div className="mt-2 grid grid-cols-7 gap-1.5">
                  <button
                    onClick={() => onUpdatePage(selected, { bg: "" })}
                    className="h-7 rounded border border-white/10 text-[9px] text-slate-400 transition hover:border-violet-400/60"
                    title="Theme paper"
                  >
                    none
                  </button>
                  {GRADIENTS.map((g) => (
                    <button
                      key={g}
                      onClick={() => onUpdatePage(selected, { bg: g })}
                      className="h-7 rounded border border-white/10 transition hover:scale-105"
                      style={{ background: g }}
                      title="Gradient"
                    />
                  ))}
                </div>
              </Field>

              <Field label="Text color" hint="Override theme ink">
                <div className="flex items-center gap-2">
                  <ColorRaw
                    value={isHex(page.ink) ? page.ink : theme.ink}
                    onChange={(c) => onUpdatePage(selected, { ink: c })}
                  />
                  {page.ink && (
                    <button
                      onClick={() => onUpdatePage(selected, { ink: "" })}
                      className="rounded-md px-2 py-1.5 text-xs text-slate-400 transition hover:text-rose-300"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </Field>

              <Field label="Accent" hint="Rules & highlights">
                <div className="flex items-center gap-2">
                  <ColorRaw
                    value={isHex(page.accent) ? page.accent : theme.accent}
                    onChange={(c) => onUpdatePage(selected, { accent: c })}
                  />
                  {page.accent && (
                    <button
                      onClick={() => onUpdatePage(selected, { accent: "" })}
                      className="rounded-md px-2 py-1.5 text-xs text-slate-400 transition hover:text-rose-300"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </Field>

              <Field label="Font">
                <Segmented
                  value={page.font || ""}
                  options={[
                    { value: "", label: "Theme" },
                    { value: "serif", label: FONT_LABELS.serif },
                    { value: "sans", label: FONT_LABELS.sans },
                    { value: "display", label: FONT_LABELS.display },
                  ]}
                  onChange={(v) => onUpdatePage(selected, { font: v as PageData["font"] })}
                />
              </Field>
            </Section>
          </>
        )}

        {/* ---------- THEME ---------- */}
        <Section icon={<Palette className="h-4 w-4" />} title="Book Theme">
          <Field label="Presets">
            <div className="grid grid-cols-3 gap-2">
              {THEME_PRESETS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => onApplyPreset(preset.theme)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-lg border p-2 transition",
                    theme.paper === preset.theme.paper &&
                      theme.accent === preset.theme.accent
                      ? "border-violet-400 bg-violet-500/10"
                      : "border-white/10 hover:border-white/30"
                  )}
                >
                  <span className="h-7 w-full rounded-md" style={{ background: preset.swatch }} />
                  <span className="text-[11px] text-slate-300">{preset.name}</span>
                </button>
              ))}
            </div>
          </Field>

          <Field label="Paper">
            <ColorRaw value={theme.paper} onChange={(c) => onUpdateTheme({ paper: c })} />
          </Field>
          <Field label="Ink">
            <ColorRaw value={theme.ink} onChange={(c) => onUpdateTheme({ ink: c })} />
          </Field>
          <Field label="Accent">
            <ColorRaw value={theme.accent} onChange={(c) => onUpdateTheme({ accent: c })} />
          </Field>
          <Field label="Default font">
            <Segmented
              value={theme.font}
              options={[
                { value: "serif", label: FONT_LABELS.serif },
                { value: "sans", label: FONT_LABELS.sans },
                { value: "display", label: FONT_LABELS.display },
              ]}
              onChange={(v) => onUpdateTheme({ font: v as FontKey })}
            />
          </Field>
        </Section>

        {/* ---------- BOOK & LIBRARY ---------- */}
        <Section icon={<Settings className="h-4 w-4" />} title="Book & Library">
          <Field label="Book title">
            <TextInput value={doc.title} onChange={(v) => onUpdateDoc({ title: v })} />
          </Field>
          <Field label="Subtitle / author">
            <TextInput value={doc.author} onChange={(v) => onUpdateDoc({ author: v })} />
          </Field>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <button
              onClick={onExport}
              className="flex items-center justify-center gap-1.5 rounded-lg bg-violet-500/90 px-3 py-2 text-sm font-medium text-white transition hover:bg-violet-500"
            >
              <Download className="h-4 w-4" /> Export
            </button>
            <button
              onClick={() => jsonInput.current?.click()}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10"
            >
              <Upload className="h-4 w-4" /> Import
            </button>
            <button
              onClick={onReset}
              className="col-span-2 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 transition hover:border-rose-400/40 hover:text-rose-300"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset to sample book
            </button>
          </div>
          <input
            ref={jsonInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = "";
            }}
          />
        </Section>

        <p className="pb-2 text-center text-[11px] text-slate-600">
          Your book auto-saves to this browser.
        </p>
      </div>
    </aside>
  );
}

/* ---------------- UI primitives ---------------- */

function Section({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-white/5 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center gap-2 text-slate-200">
        <span className="text-violet-400">{icon}</span>
        <h3 className="text-xs font-semibold uppercase tracking-wider">{title}</h3>
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between">
        <label className="text-xs font-medium text-slate-300">{label}</label>
        {hint && <span className="text-[10px] text-slate-500">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
    />
  );
}

function TextArea({
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="fancy-scroll w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm leading-relaxed text-slate-100 placeholder:text-slate-600 outline-none transition focus:border-violet-400/60 focus:ring-2 focus:ring-violet-500/20"
    />
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs font-medium transition",
        active
          ? "border-violet-400 bg-violet-500/20 text-violet-200"
          : "border-white/10 text-slate-300 hover:border-white/30 hover:text-white"
      )}
    >
      {children}
    </button>
  );
}

function Segmented({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { value: string; label?: string; icon?: ReactNode }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg border border-white/10 bg-slate-900/60 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex flex-1 items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium transition",
            value === opt.value
              ? "bg-violet-500/90 text-white shadow"
              : "text-slate-300 hover:bg-white/5 hover:text-white"
          )}
        >
          {opt.icon}
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between rounded-lg border border-white/10 bg-slate-900/40 px-3 py-2 text-left"
    >
      <span className="text-sm text-slate-200">{label}</span>
      <span
        className={cn(
          "relative h-5 w-9 rounded-full transition",
          checked ? "bg-violet-500" : "bg-slate-600"
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all",
            checked ? "left-[18px]" : "left-0.5"
          )}
        />
      </span>
    </button>
  );
}

function ColorRaw({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const safe = isHex(value) ? value : "#ffffff";
  return (
    <div className="flex items-center gap-2">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-white/15">
        <div className="h-full w-full" style={{ background: value }} />
        <input
          type="color"
          value={safe}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 font-mono text-xs text-slate-200 outline-none transition focus:border-violet-400/60"
      />
    </div>
  );
}

function ActionBtn({
  onClick,
  children,
  icon,
  disabled,
  danger,
}: {
  onClick: () => void;
  children: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40",
        danger
          ? "border-white/10 text-slate-300 hover:border-rose-400/40 hover:text-rose-300"
          : "border-white/10 text-slate-200 hover:border-white/30 hover:bg-white/5"
      )}
    >
      {icon}
      {children}
    </button>
  );
}

function GalleryEditor({
  items,
  totalPages,
  onChange,
}: {
  items: GalleryItem[];
  totalPages: number;
  onChange: (items: GalleryItem[]) => void;
}) {
  const uploadRef = useRef<HTMLInputElement>(null);

  const addItem = (url: string) => {
    onChange([
      ...items,
      { id: makeId(), url, caption: "", mapToPage: 0 },
    ]);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") addItem(reader.result);
      };
      reader.readAsDataURL(file);
    });
  };

  const updateItem = (id: string, patch: Partial<GalleryItem>) => {
    onChange(
      items.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="grid grid-cols-[44px_1fr] gap-2 rounded-lg border border-white/10 bg-slate-900/40 p-2"
        >
          <div className="h-11 w-11 overflow-hidden rounded-md border border-white/10 bg-slate-950">
            {item.url ? (
              <img
                src={item.url}
                alt={item.caption || "Gallery item"}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-600 text-xs">
                ✦
              </div>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <input
              value={item.url}
              onChange={(e) => updateItem(item.id, { url: e.target.value })}
              placeholder="Image URL"
              className="w-full rounded-md border border-white/10 bg-slate-950/60 px-2 py-1.5 text-xs text-slate-100 outline-none focus:border-violet-400/60"
            />
            <div className="grid grid-cols-[1fr_70px_auto] gap-1.5">
              <input
                value={item.caption}
                onChange={(e) =>
                  updateItem(item.id, { caption: e.target.value })
                }
                placeholder="Caption"
                className="rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 text-xs text-slate-100 outline-none focus:border-violet-400/60"
              />
              <input
                type="number"
                min={0}
                max={totalPages}
                value={item.mapToPage}
                onChange={(e) =>
                  updateItem(item.id, {
                    mapToPage: Math.max(
                      0,
                      Math.min(totalPages, Number(e.target.value) || 0)
                    ),
                  })
                }
                title="Map to page number (0 = this page)"
                placeholder="Pg"
                className="rounded-md border border-white/10 bg-slate-950/60 px-2 py-1 text-xs text-slate-100 outline-none focus:border-violet-400/60"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="rounded-md px-2 text-xs text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => uploadRef.current?.click()}
          className="flex items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 transition hover:bg-white/10"
        >
          <Upload className="h-3.5 w-3.5" /> Upload images
        </button>
        <button
          onClick={() => addItem("")}
          className="flex items-center gap-1.5 rounded-md border border-dashed border-white/15 px-2.5 py-1.5 text-xs text-slate-300 transition hover:border-violet-400/60 hover:text-violet-200"
        >
          <Plus className="h-3.5 w-3.5" /> Add URL
        </button>
        <p className="text-[10px] text-slate-500">
          Page mapper links each image to a page number.
        </p>
      </div>
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
