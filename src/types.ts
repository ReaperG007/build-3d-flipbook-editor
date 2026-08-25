import coverImg from "./assets/cover.jpg";
import coastImg from "./assets/page-coast.jpg";
import forestImg from "./assets/page-forest.jpg";

export type PageVariant =
  | "cover"
  | "topics"
  | "chapter"
  | "gallery"
  | "text"
  | "image"
  | "quote"
  | "blank";

export type Align = "left" | "center" | "right";
export type FontKey = "serif" | "sans" | "display";

export interface TopicLink {
  id: string;
  label: string;
  pageIndex: number; // zero-based page index
}

export interface GalleryItem {
  id: string;
  url: string;
  caption: string;
  mapToPage: number; // 1-based display page, 0 = this page
}

export interface LayoutBox {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
}

export type LayoutElementKind = "text" | "image" | "video" | "button" | "embed";

export type LinkStyle = "primary" | "secondary" | "glass" | "neon" | "pill";
export type EmbedType = "none" | "map" | "social" | "custom";
export type ButtonIconKey =
  | "whatsapp"
  | "instagram"
  | "facebook"
  | "x"
  | "telegram"
  | "youtube"
  | "tiktok"
  | "discord"
  | "linkedin"
  | "spotify"
  | "threads"
  | "github"
  | "mail"
  | "phone"
  | "link"
  | "globe"
  | "rocket"
  | "sparkle"
  | "compass"
  | "play"
  | "cart"
  | "chat"
  | "key"
  | "gem"
  | "eye"
  | "star";

export type ImageLayout = "single" | "side-by-side" | "grid-3" | "grid-4";

export const BUTTON_ICONS: { key: ButtonIconKey; label: string; icon: string; category?: "social" | "general" }[] = [
  { key: "whatsapp", label: "WhatsApp", icon: "🟢", category: "social" },
  { key: "instagram", label: "Instagram", icon: "📸", category: "social" },
  { key: "facebook", label: "Facebook", icon: "🔵", category: "social" },
  { key: "x", label: "X / Twitter", icon: "✖️", category: "social" },
  { key: "telegram", label: "Telegram", icon: "✈️", category: "social" },
  { key: "youtube", label: "YouTube", icon: "▶️", category: "social" },
  { key: "tiktok", label: "TikTok", icon: "🎵", category: "social" },
  { key: "discord", label: "Discord", icon: "🎮", category: "social" },
  { key: "linkedin", label: "LinkedIn", icon: "💼", category: "social" },
  { key: "spotify", label: "Spotify", icon: "🎧", category: "social" },
  { key: "threads", label: "Threads", icon: "🧵", category: "social" },
  { key: "github", label: "GitHub", icon: "🐙", category: "social" },
  { key: "mail", label: "Email", icon: "✉️", category: "social" },
  { key: "phone", label: "Phone", icon: "📞", category: "social" },
  { key: "link", label: "Link", icon: "🔗", category: "general" },
  { key: "globe", label: "Globe", icon: "🌐", category: "general" },
  { key: "rocket", label: "Rocket", icon: "🚀", category: "general" },
  { key: "sparkle", label: "Sparkle", icon: "✨", category: "general" },
  { key: "compass", label: "Compass", icon: "🧭", category: "general" },
  { key: "play", label: "Media Play", icon: "🎬", category: "general" },
  { key: "cart", label: "Store", icon: "🛍️", category: "general" },
  { key: "chat", label: "Social", icon: "💬", category: "general" },
  { key: "key", label: "Access Key", icon: "🔑", category: "general" },
  { key: "gem", label: "Diamond", icon: "💎", category: "general" },
  { key: "eye", label: "Preview", icon: "👁️", category: "general" },
  { key: "star", label: "Star", icon: "⭐", category: "general" },
];

export interface LayoutElement {
  id: string;
  kind: LayoutElementKind;
  label: string;
  box: LayoutBox;
  fontSize: number; // 0.6 - 2.2 multiplier
  objectFit: "cover" | "contain";
  align: Align;
}

export interface PageLayout {
  elements: LayoutElement[];
}



export interface PageData {
  id: string;
  variant: PageVariant;
  title: string;
  subtitle: string;
  body: string;
  image: string; // url or data-url, empty string = none
  images: string[]; // multiple images to show side by side
  imageLayout: ImageLayout; // layout mode for images
  caption: string;
  bg: string; // css background, empty = use theme paper
  ink: string; // text color, empty = use theme ink
  accent: string; // empty = use theme accent
  align: Align;
  font: FontKey | ""; // empty = inherit theme font
  pageNumber: boolean;
  topicLinks: TopicLink[];
  gallery: GalleryItem[];
  video: string; // url to a video (YouTube, Vimeo, mp4, etc.)
  popOutMedia: boolean; // auto pop out on touch/click
  linkUrl: string; // interactive link
  linkLabel: string; // button text
  linkStyle: LinkStyle; // 3D button appearance
  linkIcon: ButtonIconKey; // 3D icon for link button
  embedType: EmbedType; // map, social, custom
  embedUrl: string; // map iframe, tweet/widget URL, spotify, etc.
  embedTitle: string; // title/badge for the embed
  layout: PageLayout;
}

export interface BookTheme {
  paper: string;
  ink: string;
  accent: string;
  font: FontKey;
}

export interface BookDoc {
  title: string;
  author: string;
  theme: BookTheme;
  pages: PageData[];
}

export const FONT_STACKS: Record<FontKey, string> = {
  serif: '"Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif',
  sans: '"Inter", ui-sans-serif, system-ui, -apple-system, sans-serif',
  display: '"Playfair Display", "Iowan Old Style", Georgia, serif',
};

export const FONT_LABELS: Record<FontKey, string> = {
  serif: "Serif",
  sans: "Sans",
  display: "Display",
};

export const VARIANT_LABELS: Record<PageVariant, string> = {
  cover: "Cover",
  topics: "Topics",
  chapter: "Chapter",
  gallery: "Gallery",
  text: "Text",
  image: "Image",
  quote: "Quote",
  blank: "Blank",
};

export const THEME_PRESETS: { name: string; theme: BookTheme; swatch: string }[] =
  [
    {
      name: "Cream",
      theme: { paper: "#f5efe1", ink: "#2a2620", accent: "#b8763a", font: "serif" },
      swatch: "linear-gradient(135deg,#f5efe1,#b8763a)",
    },
    {
      name: "Midnight",
      theme: { paper: "#11151f", ink: "#e9ecf2", accent: "#7c9cff", font: "sans" },
      swatch: "linear-gradient(135deg,#11151f,#7c9cff)",
    },
    {
      name: "Sage",
      theme: { paper: "#e7ece3", ink: "#26312a", accent: "#5d8b6a", font: "serif" },
      swatch: "linear-gradient(135deg,#e7ece3,#5d8b6a)",
    },
    {
      name: "Blush",
      theme: { paper: "#f7ecee", ink: "#3a2a2e", accent: "#c97089", font: "display" },
      swatch: "linear-gradient(135deg,#f7ecee,#c97089)",
    },
    {
      name: "Slate",
      theme: { paper: "#eef1f5", ink: "#1d2430", accent: "#4f6d9c", font: "sans" },
      swatch: "linear-gradient(135deg,#eef1f5,#4f6d9c)",
    },
    {
      name: "Noir",
      theme: { paper: "#0c0c0d", ink: "#f2f2f2", accent: "#d4af37", font: "display" },
      swatch: "linear-gradient(135deg,#0c0c0d,#d4af37)",
    },
  ];

let idCounter = 0;
export function makeId(): string {
  idCounter += 1;
  return `p_${Date.now().toString(36)}_${idCounter}_${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export function blankPage(partial?: Partial<PageData>): PageData {
  return {
    id: makeId(),
    variant: "text",
    title: "",
    subtitle: "",
    body: "",
    image: "",
    images: [],
    imageLayout: "side-by-side",
    caption: "",
    bg: "",
    ink: "",
    accent: "",
    align: "left",
    font: "",
    pageNumber: true,
    topicLinks: [],
    gallery: [],
    video: "",
    popOutMedia: true,
    linkUrl: "",
    linkLabel: "",
    linkStyle: "primary",
    linkIcon: "link",
    embedType: "none",
    embedUrl: "",
    embedTitle: "",
    layout: { elements: [] },
    ...partial,
  };
}

export const SAMPLE_BOOK: BookDoc = {
  title: "Wanderlust",
  author: "A Visual Journal",
  theme: { paper: "#f5efe1", ink: "#2a2620", accent: "#b8763a", font: "serif" },
  pages: [
    blankPage({
      variant: "cover",
      title: "Wanderlust",
      subtitle: "A Visual Journal of Quiet Places",
      body: "Curated by the Editor",
      image: coverImg,
      bg: "",
      font: "display",
      pageNumber: false,
    }),
    blankPage({
      variant: "topics",
      title: "Contents",
      subtitle: "Topic Context",
      body: "The Long Road\nReturning",
      font: "display",
      pageNumber: false,
      topicLinks: [
        { id: makeId(), label: "The Long Road", pageIndex: 2 },
        { id: makeId(), label: "Returning", pageIndex: 6 },
      ],
    }),
    blankPage({
      variant: "chapter",
      title: "The Long Road",
      subtitle: "Chapter One",
      body: "Some journeys begin before the first step. They begin in the quiet hours, when the world is still blue and the road is empty.",
      font: "display",
    }),
    blankPage({
      variant: "image",
      title: "Coastal Panorama",
      caption: "Where the cliffs meet the surging tides · Tap any image to pop out in 3D",
      image: coastImg,
      images: [coastImg, forestImg],
      imageLayout: "side-by-side",
      body: "",
      pageNumber: false,
      popOutMedia: true,
      linkUrl: "https://en.wikipedia.org/wiki/Coast",
      linkLabel: "View Shoreline Field Guide",
      linkStyle: "neon",
      linkIcon: "compass",
    }),
    blankPage({
      variant: "text",
      title: "Of Tides & Time",
      body: "The coast keeps its own calendar. It measures the day in tides and the year in storms. To walk its edge is to walk beside something far older than yourself.\n\nYou learn to read the light here — how it thickens at dusk and thins at dawn, how it turns the water to glass or to mercury.",
      font: "serif",
      linkUrl: "https://en.wikipedia.org/wiki/Coast",
      linkLabel: "✦ Explore Coastal Atlas",
      linkStyle: "primary",
      embedType: "map",
      embedUrl: "https://www.openstreetmap.org/export/embed.html?bbox=-122.53%2C37.74%2C-122.45%2C37.82&layer=mapnik",
      embedTitle: "Pacific Coastline Map",
    }),
    blankPage({
      variant: "quote",
      title: "“And into the forest I go, to lose my mind and find my soul.”",
      subtitle: "— John Muir",
      body: "",
      image: forestImg,
      font: "display",
      pageNumber: false,
    }),
    blankPage({
      variant: "chapter",
      title: "Returning",
      subtitle: "Chapter Two",
      body: "We carry the places with us long after we leave. A smell of pine. The hush of fog. The way the light fell at four o'clock on a nameless trail.",
      font: "display",
    }),
    blankPage({
      variant: "text",
      title: "Field Notes",
      body: "Pack light, but pack a notebook. The best souvenirs are the ones you write down before you forget them.\n\nTravel slowly. The scenery rewards those who pause.",
      font: "serif",
    }),
    blankPage({
      variant: "blank",
      title: "",
      body: "",
      pageNumber: false,
    }),
  ],
};
