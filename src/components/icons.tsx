import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = (props: IconProps) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

export const ChevronLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m15 18-6-6 6-6" />
  </svg>
);

export const ChevronRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export const Plus = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const Trash = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const Copy = (p: IconProps) => (
  <svg {...base(p)}>
    <rect width="14" height="14" x="8" y="8" rx="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </svg>
);

export const Download = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </svg>
);

export const Upload = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
  </svg>
);

export const Image = (p: IconProps) => (
  <svg {...base(p)}>
    <rect width="18" height="18" x="3" y="3" rx="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.6-3.6a2 2 0 0 0-2.8 0L6 20" />
  </svg>
);

export const Type = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 7V4h16v3M9 20h6M12 4v16" />
  </svg>
);

export const Palette = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
  </svg>
);

export const AlignLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 6H3M15 12H3M17 18H3" />
  </svg>
);

export const AlignCenter = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 6H3M17 12H7M19 18H5" />
  </svg>
);

export const AlignRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M21 6H3M21 12H9M21 18H7" />
  </svg>
);

export const Sparkles = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8" />
  </svg>
);

export const Book = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
  </svg>
);

export const Settings = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const Grid = (p: IconProps) => (
  <svg {...base(p)}>
    <rect width="7" height="7" x="3" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="3" rx="1" />
    <rect width="7" height="7" x="14" y="14" rx="1" />
    <rect width="7" height="7" x="3" y="14" rx="1" />
  </svg>
);

export const Layers = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12.83 2.18 8.85 4.2a1 1 0 0 1 0 1.8l-8.85 4.2a2 2 0 0 1-1.66 0L2.32 8.18a1 1 0 0 1 0-1.8l8.85-4.2a2 2 0 0 1 1.66 0z" />
    <path d="M2.32 12.18 12 16.78l9.68-4.6M2.32 16.18 12 20.78l9.68-4.6" />
  </svg>
);

export const X = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);

export const Expand = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 8V5a2 2 0 0 1 2-2h3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M21 16v3a2 2 0 0 1-2 2h-3" />
  </svg>
);

export const Play = (p: IconProps) => (
  <svg {...base(p)}>
    <polygon points="6 3 20 12 6 21 6 3" />
  </svg>
);

export const Pause = (p: IconProps) => (
  <svg {...base(p)}>
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
);

export const Video = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m22 8-6 4 6 4V8Z" />
    <rect width="14" height="12" x="2" y="6" rx="2" />
  </svg>
);

export const RotateCcw = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </svg>
);

export const LinkIcon = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const ExternalLink = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

export const MapPin = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const Globe = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export const Share2 = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

export const Code = (p: IconProps) => (
  <svg {...base(p)}>
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

export const WhatsAppIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <path
      d="M17.5 6.5A7.8 7.8 0 0 0 12 4.2a7.8 7.8 0 0 0-6.8 11.7L4 20l4.3-1.1a7.8 7.8 0 0 0 3.7 1h.1a7.8 7.8 0 0 0 7.8-7.8c0-2.1-.8-4-2.4-5.6Z"
      fill="#25D366"
    />
    <path
      d="M15.4 13.9c-.2-.1-1.3-.7-1.5-.7s-.4-.1-.6.1-.7.9-.9 1.1-.3.2-.5.1c-.2-.1-1-.4-1.9-1.2-.7-.6-1.2-1.4-1.3-1.6s0-.4.1-.5.3-.3.4-.5c.1-.2.2-.3.3-.4 0-.2 0-.3-.1-.5s-.6-1.5-.8-2c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.8.4s-1 1-1 2.4 1 2.8 1.2 3c.2.2 2 3.1 4.9 4.3.7.3 1.2.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.3-.8.3-1.4.2-1.6-.1-.2-.3-.2-.5-.3Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const InstagramIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <defs>
      <radialGradient id="ig-grad" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497" />
        <stop offset="5%" stopColor="#fdf497" />
        <stop offset="45%" stopColor="#fd5949" />
        <stop offset="60%" stopColor="#d6249f" />
        <stop offset="90%" stopColor="#285AEB" />
      </radialGradient>
    </defs>
    <rect width="20" height="20" x="2" y="2" rx="5" fill="url(#ig-grad)" />
    <rect width="12" height="12" x="6" y="6" rx="3.5" stroke="#fff" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3" stroke="#fff" strokeWidth="1.5" />
    <circle cx="15.8" cy="8.2" r="0.9" fill="#fff" />
  </svg>
);

export const FacebookIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="10" fill="#1877F2" />
    <path
      d="M13.5 8.5h2V6h-2.5c-2 0-3 1.2-3 3v2H8v2.5h2V20h3v-6.5h2.2l.3-2.5H13V9.3c0-.6.3-.8.5-.8Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const XTwitterIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <rect width="20" height="20" x="2" y="2" rx="5" fill="#000000" />
    <path
      d="M14.8 6.5h1.9l-4.1 4.7 4.8 6.3h-3.8l-3-3.9-3.4 3.9H5.3l4.4-5-4.6-6h3.9l2.7 3.6 3.1-3.6Zm-.7 9.8h1L8.9 7.6H7.9l6.2 8.7Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const TelegramIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="10" fill="#229ED9" />
    <path
      d="m7 11.8 8.8-3.7c.4-.2.8.1.7.5l-1.5 7.1c-.1.5-.4.6-.8.4l-2.3-1.7-1.1 1.1c-.1.1-.3.2-.5.2l.2-2.3 4.2-3.8c.2-.2 0-.3-.3-.1l-5.2 3.3-2.2-.7c-.5-.2-.5-.5.1-.7Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const YouTubeIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <rect width="20" height="14" x="2" y="5" rx="4" fill="#FF0000" />
    <polygon points="10 8.5 15.5 12 10 15.5 10 8.5" fill="#FFFFFF" />
  </svg>
);

export const TikTokIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <rect width="20" height="20" x="2" y="2" rx="5" fill="#000000" />
    <path
      d="M14.5 6c.4.9 1.1 1.6 2 1.9v2.1c-.9 0-1.7-.3-2.4-.8v4.6c0 2.2-1.8 3.9-4 3.9s-3.9-1.8-3.9-4 1.8-3.9 3.9-3.9c.4 0 .7.1 1.1.2v2.2c-.3-.2-.7-.3-1.1-.3-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8V6h2.6Z"
      fill="#25F4EE"
    />
    <path
      d="M15 6c.4.9 1.1 1.6 2 1.9v2.1c-.9 0-1.7-.3-2.4-.8v4.6c0 2.2-1.8 3.9-4 3.9s-3.9-1.8-3.9-4 1.8-3.9 3.9-3.9c.4 0 .7.1 1.1.2v2.2c-.3-.2-.7-.3-1.1-.3-1 0-1.8.8-1.8 1.8s.8 1.8 1.8 1.8 1.8-.8 1.8-1.8V6h2.6Z"
      fill="#FE2C55"
      style={{ mixBlendMode: "screen" }}
    />
  </svg>
);

export const DiscordIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="10" fill="#5865F2" />
    <path
      d="M15.8 8.7c-.8-.4-1.6-.6-2.4-.7-.1.2-.2.4-.3.6-.9-.1-1.8-.1-2.7 0-.1-.2-.2-.4-.3-.6-.8.1-1.6.3-2.4.7-1.3 1.9-1.6 3.7-1.5 5.5 1 .8 2 1.2 3 1.3.2-.3.5-.7.7-1-.4-.1-.7-.3-1-.5.1-.1.2-.1.3-.2 2 .9 4.1.9 6.1 0 .1.1.2.1.3.2-.3.2-.7.4-1 .5.2.3.5.7.7 1 1-.1 2-.5 3-1.3.2-2.1-.3-3.9-1.5-5.5Zm-5.3 4.2c-.6 0-1.1-.5-1.1-1.2s.5-1.2 1.1-1.2 1.1.5 1.1 1.2-.5 1.2-1.1 1.2Zm3 0c-.6 0-1.1-.5-1.1-1.2s.5-1.2 1.1-1.2 1.1.5 1.1 1.2-.5 1.2-1.1 1.2Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const LinkedInIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <rect width="20" height="20" x="2" y="2" rx="4" fill="#0A66C2" />
    <circle cx="7" cy="7.5" r="1.3" fill="#FFFFFF" />
    <rect width="2.5" height="7.5" x="5.8" y="10" fill="#FFFFFF" />
    <path
      d="M10.5 10h2.4v1.1c.4-.7 1.3-1.3 2.5-1.3 2.1 0 3 1.4 3 3.6V17.5H16v-3.7c0-1-.4-1.6-1.3-1.6-.9 0-1.5.6-1.5 1.6v3.7h-2.7V10Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const SpotifyIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="10" fill="#1DB954" />
    <path
      d="M16.5 15.6c-.2 0-.4-.1-.5-.2-1.7-1.1-3.9-1.3-6.5-.7-.4.1-.7-.1-.8-.5-.1-.4.1-.7.5-.8 2.9-.6 5.3-.4 7.2.8.3.2.4.6.2.9-.1.3-.3.5-.6.5Zm.8-2c-.2 0-.4-.1-.6-.2-2-1.2-5-1.6-7.3-.9-.4.1-.9-.1-1-.5-.1-.4.1-.9.5-1 2.7-.8 6-.4 8.3 1 .3.2.4.7.2 1.1-.2.3-.5.5-.8.5Zm.1-2.2c-.3 0-.5-.1-.7-.2-2.4-1.4-6.3-1.6-8.7-.9-.5.2-1-.1-1.2-.6-.2-.5.1-1 .6-1.2 2.8-.8 7.2-.6 10 1.1.4.3.6.8.3 1.3-.2.3-.6.5-.9.5Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const ThreadsIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="10" fill="#000000" />
    <path
      d="M14.5 11.2c-.1-.2-.3-.8-.9-1.2-.5-.3-1.1-.4-1.6-.4-1.3 0-2.3.9-2.3 2.4s1 2.4 2.3 2.4c.9 0 1.5-.4 1.8-.8.4.8.4 1.8-.2 2.4-.7.8-1.8 1-2.9.8-1.8-.3-3.1-1.9-3.1-3.8 0-2.2 1.7-4 3.9-4 2 0 3.6 1.4 3.9 3.4.3 2.1-.6 4-2.2 4.9-1.1.6-2.5.6-3.8.2l.4-1.2c1 .3 2.1.3 2.9-.1 1.1-.6 1.7-1.9 1.5-3.4-.2-1.5-1.4-2.5-2.9-2.5-1.6 0-2.7 1.3-2.7 2.8 0 1.4 1 2.6 2.3 2.8.9.1 1.7-.1 2.2-.6.3-.3.4-.8.4-1.4v-.4Zm-1.2.7c0 .8-.5 1.3-1.3 1.3-.7 0-1.2-.5-1.2-1.3 0-.8.5-1.3 1.2-1.3.8 0 1.3.5 1.3 1.3Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const GitHubIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="10" fill="#24292E" />
    <path
      d="M12 6a6 6 0 0 0-1.9 11.7c.3.1.4-.1.4-.3v-1.1c-1.7.4-2-1-2-1-.3-.7-.7-.9-.7-.9-.5-.4 0-.4 0-.4.6 0 .9.6.9.6.5.9 1.4.6 1.7.5 0-.4.2-.6.4-.8-1.3-.1-2.7-.7-2.7-3 0-.7.2-1.2.6-1.6 0-.2-.3-.8.1-1.6 0 0 .5-.2 1.7.6a5.8 5.8 0 0 1 3 0c1.2-.8 1.7-.6 1.7-.6.4.8.1 1.4.1 1.6.4.4.6 1 .6 1.6 0 2.3-1.4 2.8-2.7 3 .2.2.4.6.4 1.2v1.8c0 .2.1.4.4.3A6 6 0 0 0 12 6Z"
      fill="#FFFFFF"
    />
  </svg>
);

export const MailIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <rect width="20" height="15" x="2" y="4.5" rx="3.5" fill="#EA4335" />
    <path
      d="M4 6.5 12 12.5 20 6.5"
      stroke="#FFFFFF"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

export const PhoneIcon = (p: IconProps) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" {...p}>
    <circle cx="12" cy="12" r="10" fill="#10B981" />
    <path
      d="M8.5 7.5c.3-.3.8-.3 1.1 0l1.4 1.4c.3.3.3.8 0 1.1l-.7.7c.5 1 1.3 1.8 2.3 2.3l.7-.7c.3-.3.8-.3 1.1 0l1.4 1.4c.3.3.3.8 0 1.1l-.8.8c-.8.8-2 .9-3 .3-2-1.1-3.6-2.7-4.7-4.7-.6-1-.5-2.2.3-3l.9-.9Z"
      fill="#FFFFFF"
    />
  </svg>
);
