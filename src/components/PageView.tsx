import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BUTTON_ICONS,
  type BookTheme,
  type ButtonIconKey,
  type GalleryItem,
  type PageData,
} from "../types";
import { FONT_STACKS, type FontKey } from "../types";
import {
  DiscordIcon,
  FacebookIcon,
  GitHubIcon,
  InstagramIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  SpotifyIcon,
  TelegramIcon,
  ThreadsIcon,
  TikTokIcon,
  WhatsAppIcon,
  XTwitterIcon,
  YouTubeIcon,
} from "./icons";

export interface PageViewProps {
  page: PageData;
  theme: BookTheme;
  pageNumber?: number; // 1-based display number, optional
  /** Renders an exact visual clone with all interactivity suppressed.
   *  Used by the editor's page mapper so drag handles stay usable. */
  preview?: boolean;
}

interface Resolved {
  background: string;
  color: string;
  accent: string;
  fontFamily: string;
}

function resolve(page: PageData, theme: BookTheme): Resolved {
  const fontKey: FontKey = page.font || theme.font;
  return {
    background: page.bg || theme.paper,
    color: page.ink || theme.ink,
    accent: page.accent || theme.accent,
    fontFamily: FONT_STACKS[fontKey],
  };
}

function Paragraphs({ text }: { text: string }) {
  const paras = text.split(/\n{2,}|\n/).map((p) => p.trim()).filter(Boolean);
  if (paras.length === 0) return null;
  return (
    <>
      {paras.map((p, i) => (
        <p key={i} style={{ marginBottom: "1.1em" }}>
          {p}
        </p>
      ))}
    </>
  );
}

/** A full-bleed image with a legibility gradient. */
function BgImage({
  src,
  overlay = "rgba(0,0,0,0.45)",
  darken = 0.55,
}: {
  src: string;
  overlay?: string;
  darken?: number;
}) {
  // Reset error state whenever the src changes so a new image gets a fair chance to load.
  const [ok, setOk] = useState(true);
  useEffect(() => {
    setOk(true);
  }, [src]);
  if (!ok || !src) return null;
  return (
    <>
      <img
        src={src}
        alt=""
        onError={() => setOk(false)}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: `linear-gradient(to top, rgba(0,0,0,${darken}) 0%, rgba(0,0,0,0.05) 45%, rgba(0,0,0,0.15) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          background: overlay,
          mixBlendMode: "multiply",
          opacity: 0.4,
        }}
      />
    </>
  );
}

type PopMediaFn = (
  type: "image" | "video",
  url: string,
  title?: string,
  caption?: string
) => void;

function LayoutOverlay({
  page,
  accent,
  onPopMedia,
}: {
  page: PageData;
  accent: string;
  onPopMedia?: PopMediaFn;
}) {
  if (page.layout.elements.length === 0) return null;
  return (
    <>
      {page.layout.elements.map((el) => {
        const alignItems =
          el.align === "center"
            ? "items-center text-center"
            : el.align === "right"
            ? "items-end text-right"
            : "items-start text-left";
        return (
          <div
            key={el.id}
            style={{
              position: "absolute",
              left: `${el.box.x}%`,
              top: `${el.box.y}%`,
              width: `${el.box.width}%`,
              height: `${el.box.height}%`,
              zIndex: 6,
              overflow: "hidden",
            }}
          >
            {el.kind === "text" ? (
              <div
                className={`flex h-full w-full flex-col justify-center ${alignItems}`}
                style={{
                  fontSize: `${el.fontSize * 3.8}cqmin`,
                  lineHeight: 1.3,
                  fontWeight: 600,
                }}
              >
                <Paragraphs text={page.body || page.title || "Text block"} />
              </div>
            ) : el.kind === "image" && page.image ? (
              <div
                onClick={() =>
                  onPopMedia?.("image", page.image, page.title || "Image", page.caption)
                }
                className="group relative h-full w-full cursor-pointer transition-transform duration-300 hover:scale-[1.03]"
                style={{
                  borderRadius: "1.5cqmin",
                  overflow: "hidden",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.3)",
                }}
                title="Tap to pop out in 3D"
              >
                <img
                  src={page.image}
                  alt={page.title || ""}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: el.objectFit,
                    display: "block",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    top: "1cqmin",
                    right: "1cqmin",
                    padding: "0.4cqmin 0.9cqmin",
                    borderRadius: "999px",
                    background: "rgba(15,23,42,0.75)",
                    backdropFilter: "blur(6px)",
                    color: "#fff",
                    fontSize: "2cqmin",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ⛶ Pop Out
                </div>
              </div>
            ) : el.kind === "video" && page.video ? (
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  borderRadius: "1.5cqmin",
                  overflow: "hidden",
                  background: "#000",
                  boxShadow: "0 10px 28px rgba(0,0,0,0.4)",
                }}
                className="group"
                // Prevent drag/flip handlers from stealing the click when
                // interacting with the video player.
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                {isVideoStream(page.video) ? (
                  <iframe
                    key={page.video}
                    src={normalizeVideoUrl(page.video)}
                    title="Embedded video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    referrerPolicy="strict-origin-when-cross-origin"
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      border: 0,
                    }}
                  />
                ) : (
                  <video
                    key={page.video}
                    src={page.video}
                    controls
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: el.objectFit,
                      display: "block",
                    }}
                  />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onPopMedia?.("video", page.video, page.title || "Video Player");
                  }}
                  style={{
                    position: "absolute",
                    top: "1cqmin",
                    right: "1cqmin",
                    zIndex: 10,
                    padding: "0.4cqmin 1cqmin",
                    borderRadius: "999px",
                    background: "rgba(15,23,42,0.8)",
                    backdropFilter: "blur(6px)",
                    color: "#fff",
                    fontSize: "2cqmin",
                    border: "1px solid rgba(255,255,255,0.2)",
                    cursor: "pointer",
                  }}
                  title="Pop out video player"
                >
                  ⛶ Pop Out
                </button>
              </div>
            ) : el.kind === "button" && page.linkUrl ? (
              <div
                className={`flex h-full w-full items-center ${
                  el.align === "center"
                    ? "justify-center"
                    : el.align === "right"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <Interactive3DButton
                  url={page.linkUrl}
                  label={page.linkLabel || "Explore Link"}
                  styleType={page.linkStyle || "primary"}
                  iconKey={page.linkIcon || "link"}
                  accent={accent}
                  fontSize={`${el.fontSize * 3.2}cqmin`}
                />
              </div>
            ) : el.kind === "embed" && page.embedUrl ? (
              <IframeEmbedSpace
                type={page.embedType || "custom"}
                url={page.embedUrl}
                title={page.embedTitle || "Interactive Embed"}
                accent={accent}
                compact
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

export default function PageView({
  page,
  theme,
  pageNumber,
  preview = false,
}: PageViewProps) {
  const r = resolve(page, theme);
  const [poppedMedia, setPoppedMedia] = useState<{
    type: "image" | "video";
    url: string;
    title?: string;
    caption?: string;
  } | null>(null);

  const isCover = page.variant === "cover";
  const isQuote = page.variant === "quote";
  const isBlank = page.variant === "blank";
  const hasBgImage =
    (isCover || isQuote) && page.image.trim().length > 0;

  const pad = "11cqmin";
  const baseStyle: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    containerType: "size",
    background: r.background,
    color: hasBgImage ? "#fff" : r.color,
    fontFamily: r.fontFamily,
    overflow: "hidden",
    userSelect: "none",
    zIndex: 1,
  };

  if (isBlank) {
    return (
      <div style={baseStyle}>
        <BlankDecor accent={r.accent} />
      </div>
    );
  }

  const alignClass =
    page.align === "center"
      ? "items-center text-center"
      : page.align === "right"
      ? "items-end text-right"
      : "items-start text-left";

  const showNumber = page.pageNumber && pageNumber != null;

  const handlePopMedia = (
    type: "image" | "video",
    url: string,
    title?: string,
    caption?: string
  ) => {
    if (preview || !url) return;
    setPoppedMedia({ type, url, title, caption });
  };

  return (
    <div style={baseStyle}>
      {hasBgImage && (
        <BgImage src={page.image} darken={isCover ? 0.6 : 0.7} />
      )}

      {/* faint paper grain for solid backgrounds */}
      {!hasBgImage && <PaperGrain />}

      <LayoutOverlay
        page={page}
        accent={r.accent}
        onPopMedia={handlePopMedia}
      />

      {/* content */}
      <div
        className={`flex flex-col ${alignClass} justify-center`}
        style={{
          position: "relative",
          zIndex: 2,
          height: "100%",
          width: "100%",
          padding: pad,
        }}
      >
        {page.variant === "cover" && (
          <CoverContent
            page={page}
            accent={r.accent}
            onPopMedia={handlePopMedia}
          />
        )}
        {page.variant === "topics" && (
          <TopicContent page={page} accent={r.accent} />
        )}
        {page.variant === "chapter" && (
          <ChapterContent page={page} accent={r.accent} />
        )}
        {page.variant === "gallery" && (
          <GalleryContent
            page={page}
            accent={r.accent}
            onPopMedia={handlePopMedia}
          />
        )}
        {page.variant === "text" && (
          <TextContent page={page} accent={r.accent} />
        )}
        {page.variant === "image" && (
          <ImageContent
            page={page}
            accent={r.accent}
            onPopMedia={handlePopMedia}
          />
        )}
        {page.variant === "quote" && (
          <QuoteContent page={page} accent={r.accent} />
        )}

        {/* Embedded Interactive 3D Action Button (if specified and not already using custom layout) */}
        {page.layout.elements.length === 0 &&
          page.variant !== "blank" &&
          page.linkUrl.trim() && (
            <div style={{ marginTop: "4cqmin" }}>
              <Interactive3DButton
                url={page.linkUrl}
                label={page.linkLabel || "Open Link"}
                styleType={page.linkStyle || "primary"}
                iconKey={page.linkIcon || "link"}
                accent={r.accent}
              />
            </div>
          )}

        {/* Embedded Iframe / Map / Social Space (if specified and not using custom layout) */}
        {page.layout.elements.length === 0 &&
          page.variant !== "blank" &&
          page.embedType !== "none" &&
          page.embedUrl.trim() && (
            <div style={{ marginTop: "3cqmin", width: "100%" }}>
              <IframeEmbedSpace
                type={page.embedType}
                url={page.embedUrl}
                title={page.embedTitle || "Interactive Preview"}
                accent={r.accent}
              />
            </div>
          )}

        {page.layout.elements.length === 0 &&
          page.variant !== "blank" &&
          page.video.trim() && (
            <VideoEmbed
              url={page.video}
              accent={r.accent}
              onPopOut={() =>
                handlePopMedia("video", page.video, page.title || "Video Player")
              }
            />
          )}
      </div>

      {/* page number */}
      {showNumber && (
        <div
          style={{
            position: "absolute",
            bottom: "5cqmin",
            left: 0,
            right: 0,
            textAlign: "center",
            zIndex: 3,
            fontSize: "3.1cqmin",
            letterSpacing: "0.2em",
            opacity: 0.6,
          }}
        >
          {pageNumber}
        </div>
      )}

      {/* Floating 3D Pop-Out Media Player Modal */}
      {poppedMedia && !preview && (
        <PopOutMediaModal
          media={poppedMedia}
          accent={r.accent}
          onClose={() => setPoppedMedia(null)}
        />
      )}
    </div>
  );
}

function Kicker({ children, accent }: { children: React.ReactNode; accent: string }) {
  return (
    <div
      style={{
        fontSize: "3.2cqmin",
        letterSpacing: "0.35em",
        textTransform: "uppercase",
        color: accent,
        fontWeight: 600,
        marginBottom: "3cqmin",
      }}
    >
      {children}
    </div>
  );
}

function Rule({ accent, width = "20cqmin" }: { accent: string; width?: string }) {
  return (
    <div
      style={{
        height: "2px",
        width,
        background: accent,
        opacity: 0.85,
        margin: "4cqmin 0",
      }}
    />
  );
}

function CoverContent({
  page,
  accent,
  onPopMedia,
}: {
  page: PageData;
  accent: string;
  onPopMedia?: PopMediaFn;
}) {
  return (
    <div className="w-full" style={{ marginTop: "auto", marginBottom: "6cqmin" }}>
      {page.image && (
        <div
          onClick={() =>
            onPopMedia?.("image", page.image, page.title || "Cover Artwork", page.subtitle)
          }
          className="group absolute right-[6cqmin] top-[6cqmin] z-10 flex cursor-pointer items-center gap-[1cqmin] rounded-full border border-white/20 bg-slate-950/60 px-[2cqmin] py-[1cqmin] text-[2.2cqmin] font-medium text-white opacity-40 backdrop-blur-md transition-all hover:opacity-100"
          title="Pop out cover artwork in 3D"
        >
          <span>⛶</span>
          <span>Pop Out</span>
        </div>
      )}
      {page.subtitle && <Kicker accent={accent}>{page.subtitle}</Kicker>}
      <h1
        style={{
          fontSize: "13cqmin",
          lineHeight: 1.02,
          fontWeight: 800,
          letterSpacing: "-0.01em",
          marginBottom: "4cqmin",
        }}
      >
        {page.title}
      </h1>
      {page.body && (
        <div
          style={{
            fontSize: "3.6cqmin",
            opacity: 0.9,
            letterSpacing: "0.04em",
          }}
        >
          {page.body}
        </div>
      )}
    </div>
  );
}

function TopicContent({ page, accent }: { page: PageData; accent: string }) {
  const topics = page.topicLinks.length
    ? page.topicLinks.map((link) => link.label)
    : page.body
        .split(/\n+/)
        .map((topic) => topic.trim())
        .filter(Boolean);

  return (
    <div className="w-full">
      {page.subtitle && <Kicker accent={accent}>{page.subtitle}</Kicker>}
      <h2
        style={{
          fontSize: "8cqmin",
          lineHeight: 1.05,
          fontWeight: 800,
          letterSpacing: "-0.02em",
          marginBottom: "3cqmin",
        }}
      >
        {page.title || "Contents"}
      </h2>
      <Rule accent={accent} width="18cqmin" />
      <div style={{ display: "grid", gap: "2.2cqmin", marginTop: "4cqmin" }}>
        {(topics.length ? topics : ["Add chapter pages to build this context."]).map(
          (topic, index) => (
            <div
              key={topic}
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "3cqmin",
                alignItems: "baseline",
              }}
            >
              <span
                style={{
                  color: accent,
                  fontSize: "3.2cqmin",
                  fontWeight: 800,
                  letterSpacing: "0.16em",
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <span style={{ fontSize: "4.8cqmin", lineHeight: 1.15 }}>
                {topic}
              </span>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ChapterContent({ page, accent }: { page: PageData; accent: string }) {
  return (
    <div className="w-full">
      {page.subtitle && <Kicker accent={accent}>{page.subtitle}</Kicker>}
      <h2
        style={{
          fontSize: "9cqmin",
          lineHeight: 1.05,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          marginBottom: "1cqmin",
        }}
      >
        {page.title}
      </h2>
      <Rule accent={accent} />
      {page.body && (
        <div
          style={{
            fontSize: "4cqmin",
            lineHeight: 1.7,
            maxWidth: "85%",
            opacity: 0.92,
          }}
        >
          <Paragraphs text={page.body} />
        </div>
      )}
    </div>
  );
}

function TextContent({ page, accent }: { page: PageData; accent: string }) {
  return (
    <div className="w-full">
      {page.title && (
        <>
          <h3
            style={{
              fontSize: "6.2cqmin",
              lineHeight: 1.1,
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            {page.title}
          </h3>
          <Rule accent={accent} width="14cqmin" />
        </>
      )}
      {page.body && (
        <div style={{ fontSize: "3.9cqmin", lineHeight: 1.75 }}>
          <Paragraphs text={page.body} />
        </div>
      )}
    </div>
  );
}

function GalleryContent({
  page,
  accent,
  onPopMedia,
}: {
  page: PageData;
  accent: string;
  onPopMedia?: PopMediaFn;
}) {
  const items = page.gallery.length
    ? page.gallery
    : page.image
    ? [
        {
          id: "fallback",
          url: page.image,
          caption: page.caption || page.title || "Gallery",
          mapToPage: 0,
        },
      ]
    : [];
  const cols = items.length <= 1 ? 1 : items.length <= 4 ? 2 : 3;
  return (
    <div className="w-full">
      {page.subtitle && <Kicker accent={accent}>{page.subtitle}</Kicker>}
      <h2
        style={{
          fontSize: "6.4cqmin",
          lineHeight: 1.05,
          fontWeight: 750,
          letterSpacing: "-0.01em",
          marginBottom: "3cqmin",
        }}
      >
        {page.title || "Gallery"}
      </h2>
      <Rule accent={accent} width="16cqmin" />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: "2.4cqmin",
          marginTop: "3cqmin",
        }}
      >
        {items.map((item) => (
          <GalleryCard
            key={item.id}
            item={item}
            accent={accent}
            onPopOut={() =>
              onPopMedia?.(
                "image",
                item.url,
                item.caption || page.title || "Gallery Image",
                item.mapToPage ? `Mapped to Page ${item.mapToPage}` : undefined
              )
            }
          />
        ))}
      </div>
      {items.length === 0 && (
        <p
          style={{
            color: accent,
            opacity: 0.7,
            fontSize: "3.2cqmin",
            fontStyle: "italic",
          }}
        >
          Add images in the editor to build this gallery.
        </p>
      )}
    </div>
  );
}

function GalleryCard({
  item,
  accent,
  onPopOut,
}: {
  item: GalleryItem;
  accent: string;
  onPopOut?: () => void;
}) {
  return (
    <figure
      style={{
        margin: 0,
        display: "grid",
        gap: "1.2cqmin",
        breakInside: "avoid",
      }}
    >
      <div
        onClick={onPopOut}
        style={{
          position: "relative",
          borderRadius: "1.2cqmin",
          overflow: "hidden",
          background: "rgba(0,0,0,0.08)",
          aspectRatio: "4/3",
          cursor: "pointer",
        }}
        className="group transition-transform duration-300 hover:scale-[1.04]"
        title="Tap to pop out in 3D"
      >
        {item.url ? (
          <img
            src={item.url}
            alt={item.caption}
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accent,
              opacity: 0.5,
              fontSize: "6cqmin",
            }}
          >
            ✦
          </div>
        )}
        {item.mapToPage > 0 && (
          <span
            style={{
              position: "absolute",
              top: "1.2cqmin",
              left: "1.2cqmin",
              padding: "0.4cqmin 1.1cqmin",
              borderRadius: "999px",
              background: "rgba(0,0,0,0.55)",
              color: "#fff",
              fontSize: "2.2cqmin",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            p. {item.mapToPage}
          </span>
        )}
        <div
          style={{
            position: "absolute",
            bottom: "1cqmin",
            right: "1cqmin",
            padding: "0.3cqmin 0.8cqmin",
            borderRadius: "999px",
            background: "rgba(15,23,42,0.8)",
            color: "#fff",
            fontSize: "1.9cqmin",
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          ⛶ Pop Out
        </div>
      </div>
      {item.caption && (
        <figcaption
          style={{
            fontSize: "2.6cqmin",
            lineHeight: 1.25,
            opacity: 0.85,
          }}
        >
          {item.caption}
        </figcaption>
      )}
    </figure>
  );
}

function VideoEmbed({
  url,
  accent,
  onPopOut,
}: {
  url: string;
  accent: string;
  onPopOut?: () => void;
}) {
  const normalized = normalizeVideoUrl(url);
  return (
    <div
      style={{
        position: "absolute",
        right: "3cqmin",
        bottom: "3cqmin",
        zIndex: 4,
        maxWidth: "36cqmin",
        minWidth: "24cqmin",
        display: "grid",
        gap: "1.2cqmin",
        padding: "1.6cqmin",
        borderRadius: "1.8cqmin",
        background: "rgba(8, 11, 22, 0.88)",
        border: `1px solid ${accent}66`,
        boxShadow: "0 20px 45px rgba(0,0,0,0.45)",
        color: "#fff",
        backdropFilter: "blur(12px)",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "2.3cqmin",
          color: accent,
          fontWeight: 700,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1cqmin" }}>
          <span>▶</span>
          <span style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}>
            Video
          </span>
        </div>
        <button
          onClick={onPopOut}
          style={{
            background: "rgba(255,255,255,0.12)",
            border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff",
            borderRadius: "999px",
            padding: "0.3cqmin 0.9cqmin",
            fontSize: "2cqmin",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.4cqmin",
          }}
          title="Pop out video player in 3D"
        >
          <span>⛶</span>
          <span>Pop Out</span>
        </button>
      </div>
      <div
        style={{
          position: "relative",
          borderRadius: "1.2cqmin",
          overflow: "hidden",
          aspectRatio: "16/9",
          background: "#000",
        }}
      >
        {isVideoStream(url) ? (
          <iframe
            key={url}
            src={normalized}
            title="Embedded video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
            }}
          />
        ) : (
          <video
            key={url}
            src={url}
            controls
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        )}
      </div>
    </div>
  );
}

function isVideoStream(url: string): boolean {
  const trimmed = url.trim();
  return /(youtube\.com|youtu\.be|vimeo\.com|loom\.com|dailymotion\.com)/i.test(trimmed);
}

function normalizeVideoUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/(youtube\.com\/watch|youtu\.be\/|youtube\.com\/embed)/i.test(trimmed)) {
    const youtubeId = extractYouTube(trimmed);
    if (youtubeId) {
      return `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1`;
    }
  } else if (/vimeo\.com\//i.test(trimmed)) {
    const vimeoId = extractVimeo(trimmed);
    if (vimeoId) {
      return `https://player.vimeo.com/video/${vimeoId}`;
    }
  } else if (/loom\.com\/share\/([\w-]+)/i.test(trimmed)) {
    const match = /loom\.com\/share\/([\w-]+)/i.exec(trimmed);
    if (match) return `https://www.loom.com/embed/${match[1]}`;
  }
  return trimmed;
}

function extractYouTube(url: string): string | null {
  const short = /youtu\.be\/([\w-]+)/.exec(url);
  if (short) return short[1];
  const long = /[?&]v=([\w-]+)/.exec(url);
  if (long) return long[1];
  const embed = /embed\/([\w-]+)/.exec(url);
  return embed ? embed[1] : null;
}

function extractVimeo(url: string): string | null {
  const match = /vimeo\.com\/(?:video\/)?(\d+)/.exec(url);
  return match ? match[1] : null;
}

function normalizeEmbedUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  // Check if raw is an entire <iframe ... src="..." ...> snippet
  const srcMatch = /src=["']([^"']+)["']/i.exec(trimmed);
  if (srcMatch) return srcMatch[1];

  // Spotify track or playlist URL -> embed URL
  if (/open\.spotify\.com\/(track|playlist|album|episode)\/([\w-]+)/i.test(trimmed)) {
    return trimmed.replace("open.spotify.com/", "open.spotify.com/embed/");
  }

  // Google Maps standard share URL -> embed URL
  if (/google\.com\/maps/i.test(trimmed) && !/embed/i.test(trimmed)) {
    const qMatch = /[?&]q=([^&]+)/.exec(trimmed);
    if (qMatch) {
      return `https://maps.google.com/maps?q=${qMatch[1]}&output=embed`;
    }
  }

  return trimmed;
}

function Social3DBadge({ iconKey }: { iconKey: ButtonIconKey }) {
  switch (iconKey) {
    case "whatsapp":
      return <WhatsAppIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(37,211,102,0.6)]" />;
    case "instagram":
      return <InstagramIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(225,48,108,0.6)]" />;
    case "facebook":
      return <FacebookIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(24,119,242,0.6)]" />;
    case "x":
      return <XTwitterIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(255,255,255,0.4)]" />;
    case "telegram":
      return <TelegramIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(34,158,217,0.6)]" />;
    case "youtube":
      return <YouTubeIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(255,0,0,0.6)]" />;
    case "tiktok":
      return <TikTokIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(37,244,238,0.5)]" />;
    case "discord":
      return <DiscordIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(88,101,242,0.6)]" />;
    case "linkedin":
      return <LinkedInIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(10,102,194,0.6)]" />;
    case "spotify":
      return <SpotifyIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(29,185,84,0.6)]" />;
    case "threads":
      return <ThreadsIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(255,255,255,0.3)]" />;
    case "github":
      return <GitHubIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(255,255,255,0.3)]" />;
    case "mail":
      return <MailIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(234,67,53,0.6)]" />;
    case "phone":
      return <PhoneIcon className="h-[1.25em] w-[1.25em] filter drop-shadow-[0_2px_6px_rgba(16,185,129,0.6)]" />;
    default: {
      const found = BUTTON_ICONS.find((i) => i.key === iconKey) || BUTTON_ICONS[0];
      return <span style={{ fontSize: "1.15em" }}>{found.icon}</span>;
    }
  }
}

function Interactive3DButton({
  url,
  label,
  styleType = "primary",
  iconKey = "link",
  accent,
  fontSize = "3.2cqmin",
}: {
  url: string;
  label: string;
  styleType?: "primary" | "secondary" | "glass" | "neon" | "pill";
  iconKey?: ButtonIconKey;
  accent: string;
  fontSize?: string;
}) {
  const [pressed, setPressed] = useState(false);

  const getStyle = (): React.CSSProperties => {
    switch (styleType) {
      case "secondary":
        return {
          background: "linear-gradient(180deg, #2a3342 0%, #151b26 100%)",
          color: "#f1f5f9",
          borderTop: "1px solid rgba(255,255,255,0.2)",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          borderRight: "1px solid rgba(0,0,0,0.4)",
          borderBottom: "3px solid #0b0f17",
          boxShadow: pressed
            ? "0 1px 2px rgba(0,0,0,0.6)"
            : "0 6px 14px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.25)",
        };
      case "glass":
        return {
          background: "rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(12px)",
          color: "#ffffff",
          borderTop: "1px solid rgba(255,255,255,0.4)",
          borderLeft: "1px solid rgba(255,255,255,0.25)",
          borderRight: "1px solid rgba(0,0,0,0.2)",
          borderBottom: "3px solid rgba(0,0,0,0.3)",
          boxShadow: pressed
            ? "0 1px 3px rgba(0,0,0,0.3)"
            : "0 8px 20px rgba(0,0,0,0.25), inset 0 1px 1px rgba(255,255,255,0.4)",
        };
      case "neon":
        return {
          background: "#080c18",
          color: "#67e8f9",
          border: `1.5px solid #38bdf8`,
          borderBottom: `3.5px solid #0284c7`,
          boxShadow: pressed
            ? `0 0 6px rgba(56,189,248,0.5)`
            : `0 0 14px rgba(56,189,248,0.35), 0 4px 10px rgba(0,0,0,0.5)`,
        };
      case "pill":
        return {
          background: `linear-gradient(135deg, ${accent}, #4f46e5)`,
          color: "#ffffff",
          borderRadius: "999px",
          borderBottom: "3px solid rgba(0,0,0,0.35)",
          boxShadow: pressed
            ? "0 1px 3px rgba(0,0,0,0.4)"
            : "0 6px 16px rgba(79,70,229,0.35)",
        };
      case "primary":
      default:
        return {
          background: `linear-gradient(180deg, ${accent} 0%, #4338ca 100%)`,
          color: "#ffffff",
          borderTop: "1px solid rgba(255,255,255,0.35)",
          borderLeft: "1px solid rgba(255,255,255,0.2)",
          borderRight: "1px solid rgba(0,0,0,0.3)",
          borderBottom: "4px solid rgba(15,23,42,0.6)",
          boxShadow: pressed
            ? "0 1px 2px rgba(0,0,0,0.5)"
            : "0 8px 18px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.3)",
        };
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url) return;
    const targetUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.6cqmin",
        padding: "1.8cqmin 3.8cqmin",
        borderRadius: styleType === "pill" ? "999px" : "1.8cqmin",
        fontSize,
        fontWeight: 700,
        letterSpacing: "0.04em",
        cursor: "pointer",
        transition: "all 0.1s cubic-bezier(0.34, 1.56, 0.64, 1)",
        transform: pressed ? "translateY(3px) scale(0.98)" : "translateY(0) scale(1)",
        userSelect: "none",
        ...getStyle(),
      }}
      title={`Open ${url}`}
    >
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          transform: "translateZ(8px)",
        }}
      >
        <Social3DBadge iconKey={iconKey} />
      </span>
      <span>{label || "Explore Link"}</span>
      <span style={{ fontSize: "0.85em", opacity: 0.85, transform: "translateZ(4px)" }}>
        ↗
      </span>
    </button>
  );
}

function IframeEmbedSpace({
  type,
  url,
  title,
  accent,
  compact = false,
}: {
  type: string;
  url: string;
  title: string;
  accent: string;
  compact?: boolean;
}) {
  const normalized = normalizeEmbedUrl(url);
  const isMap = type === "map" || /openstreetmap|google.*maps|apple.*maps/i.test(url);
  const isSocial = type === "social" || /twitter|x\.com|spotify|codepen|instagram/i.test(url);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        borderRadius: "1.8cqmin",
        overflow: "hidden",
        background: "rgba(11, 15, 25, 0.88)",
        border: `1px solid ${accent}44`,
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        display: "flex",
        flexDirection: "column",
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: compact ? "1cqmin 1.8cqmin" : "1.4cqmin 2.4cqmin",
          background: "rgba(255,255,255,0.04)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          fontSize: "2.3cqmin",
          color: "#e2e8f0",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "1cqmin", fontWeight: 700 }}>
          <span style={{ color: accent }}>{isMap ? "🗺️" : isSocial ? "💬" : "🌐"}</span>
          <span>{title || (isMap ? "Interactive Map" : isSocial ? "Social Card" : "Web Embed")}</span>
        </div>
        {normalized && (
          <a
            href={normalized}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: accent,
              textDecoration: "none",
              fontSize: "2.1cqmin",
              display: "flex",
              alignItems: "center",
              gap: "0.5cqmin",
              fontWeight: 600,
            }}
            title="Open in new tab"
          >
            Open ↗
          </a>
        )}
      </div>

      {/* Embedded Iframe body */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: compact ? "100%" : "22cqmin",
          minHeight: "16cqmin",
          background: "#080c14",
        }}
      >
        {normalized ? (
          <iframe
            key={normalized}
            src={normalized}
            title={title || "Embedded Content"}
            sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-forms allow-presentation"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            loading="lazy"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              border: 0,
              background: "#080c14",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accent,
              opacity: 0.5,
              fontSize: "2.6cqmin",
              fontStyle: "italic",
            }}
          >
            Paste map/social iframe link in the editor
          </div>
        )}
      </div>
    </div>
  );
}

function ImageContent({
  page,
  accent,
  onPopMedia,
}: {
  page: PageData;
  accent: string;
  onPopMedia?: PopMediaFn;
}) {
  // Empty strings in `images` (left by the editor's "Add URL" button) used to
  // produce `<img src="">` which erroring out hid every image on the page.
  // Filter them and fall back to the single-image field.
  const imageList = (
    page.images?.length ? page.images : page.image ? [page.image] : []
  )
    .map((url) => (url || "").trim())
    .filter(Boolean);
  const isMulti = imageList.length > 1;
  const layout = page.imageLayout || "side-by-side";
  const cols =
    layout === "grid-4" || imageList.length >= 4
      ? 2
      : layout === "grid-3" || imageList.length === 3
      ? 3
      : isMulti
      ? 2
      : 1;

  return (
    <div
      className="w-full"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {page.title && (
        <h3
          style={{
            fontSize: "4.4cqmin",
            fontWeight: 700,
            letterSpacing: "0.02em",
            marginBottom: "3cqmin",
          }}
        >
          {page.title}
        </h3>
      )}

      {/* Media Stage: Single or Multi-Image Side-by-Side */}
      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: isMulti ? "2cqmin" : "0",
          alignItems: "stretch",
        }}
      >
        {imageList.length > 0 ? (
          imageList.map((imgUrl, idx) => (
            <SingleImageCard
              key={`${imgUrl}-${idx}`}
              url={imgUrl}
              accent={accent}
              onPopOut={() =>
                onPopMedia?.(
                  "image",
                  imgUrl,
                  page.title || `Image ${idx + 1}`,
                  page.caption
                )
              }
            />
          ))
        ) : (
          <div
            style={{
              borderRadius: "2cqmin",
              overflow: "hidden",
              background: "rgba(0,0,0,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: accent,
              opacity: 0.5,
            }}
          >
            <span style={{ fontSize: "10cqmin" }}>✦</span>
          </div>
        )}
      </div>

      {page.caption && (
        <div
          style={{
            fontSize: "3.2cqmin",
            fontStyle: "italic",
            opacity: 0.85,
            marginTop: "2.5cqmin",
            lineHeight: 1.4,
          }}
        >
          {page.caption}
        </div>
      )}
    </div>
  );
}

function SingleImageCard({
  url,
  accent,
  onPopOut,
}: {
  url: string;
  accent: string;
  onPopOut?: () => void;
}) {
  // Reset load state whenever the URL changes so a valid new image is not hidden
  // by a stale error flag from a previous URL.
  const [ok, setOk] = useState(true);
  useEffect(() => {
    setOk(true);
  }, [url]);

  return (
    <div
      onClick={onPopOut}
      className="group relative h-full w-full cursor-pointer overflow-hidden rounded-[2cqmin] transition-all duration-300 hover:scale-[1.03]"
      style={{
        background: "rgba(0,0,0,0.06)",
        boxShadow: "0 8px 25px rgba(0,0,0,0.3)",
      }}
      title="Tap to pop out in 3D"
    >
      {ok && url ? (
        <img
          key={url}
          src={url}
          alt=""
          onError={() => setOk(false)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: accent,
            opacity: 0.5,
          }}
        >
          <span style={{ fontSize: "8cqmin" }}>✦</span>
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: "1.2cqmin",
          right: "1.2cqmin",
          padding: "0.4cqmin 1.1cqmin",
          borderRadius: "999px",
          background: "rgba(15,23,42,0.8)",
          backdropFilter: "blur(8px)",
          color: "#fff",
          fontSize: "2cqmin",
          letterSpacing: "0.08em",
          border: "1px solid rgba(255,255,255,0.15)",
        }}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ⛶ Pop Out
      </div>
    </div>
  );
}

function PopOutMediaModal({
  media,
  accent,
  onClose,
}: {
  media: {
    type: "image" | "video";
    url: string;
    title?: string;
    caption?: string;
  };
  accent: string;
  onClose: () => void;
}) {
  // Escape closes the theater.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Portal to <body>. The book wraps pages in 3D-transformed, `overflow:hidden`
  // ancestors — a `transform` becomes the containing block for `position:fixed`
  // descendants, which previously clipped and rotated the pop-out with the page.
  // Rendering at the body level lets it float freely above the whole book.
  return createPortal(
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(3, 6, 15, 0.85)",
        backdropFilter: "blur(18px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        animation: "floatUp 0.3s cubic-bezier(0.22, 0.61, 0.36, 1)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "860px",
          maxHeight: "90vh",
          borderRadius: "20px",
          overflow: "hidden",
          background: "#0b0f19",
          border: `1.5px solid ${accent}66`,
          boxShadow: `0 35px 80px -15px rgba(0,0,0,0.85), 0 0 35px ${accent}22`,
          display: "flex",
          flexDirection: "column",
          transform: "translateZ(60px)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "14px 20px",
            background: "rgba(255,255,255,0.03)",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "16px" }}>
              {media.type === "video" ? "🎬" : "🖼️"}
            </span>
            <div>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "#f8fafc",
                }}
              >
                {media.title || (media.type === "video" ? "Video Player" : "Image Preview")}
              </div>
              {media.caption && (
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>
                  {media.caption}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.12)",
              color: "#e2e8f0",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ✕ Close (Esc)
          </button>
        </div>

        {/* Media Frame */}
        <div
          style={{
            position: "relative",
            width: "100%",
            background: "#020408",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "360px",
            maxHeight: "70vh",
            overflow: "hidden",
          }}
        >
          {media.type === "image" ? (
            <img
              src={media.url}
              alt={media.title || ""}
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "70vh",
                objectFit: "contain",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16/9",
                maxHeight: "70vh",
              }}
            >
              {isVideoStream(media.url) ? (
                <iframe
                  key={media.url}
                  src={
                    normalizeVideoUrl(media.url) +
                    (normalizeVideoUrl(media.url).includes("?") ? "&" : "?") +
                    "autoplay=1"
                  }
                  title="Pop-out Video Player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    border: 0,
                  }}
                />
              ) : (
                <video
                  key={media.url}
                  src={media.url}
                  controls
                  autoPlay
                  playsInline
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

function QuoteContent({ page, accent }: { page: PageData; accent: string }) {
  return (
    <div className="w-full">
      <div
        style={{
          fontFamily: "Georgia, serif",
          fontSize: "20cqmin",
          lineHeight: 0.6,
          color: accent,
          opacity: 0.5,
          height: "7cqmin",
        }}
      >
        “
      </div>
      <blockquote
        style={{
          fontSize: "6.4cqmin",
          lineHeight: 1.25,
          fontWeight: 600,
          fontStyle: "italic",
          margin: 0,
        }}
      >
        {page.title}
      </blockquote>
      {page.subtitle && (
        <div
          style={{
            marginTop: "5cqmin",
            fontSize: "3.6cqmin",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            opacity: 0.9,
            color: accent,
          }}
        >
          {page.subtitle}
        </div>
      )}
    </div>
  );
}

function BlankDecor({ accent }: { accent: string }) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: "10cqmin",
          height: "10cqmin",
          borderRadius: "50%",
          border: `1px solid ${accent}`,
          opacity: 0.25,
        }}
      />
    </div>
  );
}

function PaperGrain() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        background:
          "radial-gradient(circle at 25% 18%, rgba(0,0,0,0.03), transparent 55%), radial-gradient(circle at 80% 85%, rgba(0,0,0,0.04), transparent 50%)",
      }}
    />
  );
}
