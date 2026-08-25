import type { CSSProperties } from "react";
import type { BookTheme, PageData } from "../types";
import { cn } from "../utils/cn";
import PageView from "./PageView";

export const PAGE_RATIO = 0.7; // width / height

interface ThumbnailProps {
  page: PageData;
  theme: BookTheme;
  index: number; // 0-based
  width: number;
  selected: boolean;
  onSelect: () => void;
}

export default function Thumbnail({
  page,
  theme,
  index,
  width,
  selected,
  onSelect,
}: ThumbnailProps) {
  const height = Math.round(width / PAGE_RATIO);
  const stageStyle: CSSProperties = {
    width,
    height,
    position: "relative",
    overflow: "hidden",
    borderRadius: 4,
    boxShadow: "0 1px 3px rgba(0,0,0,0.4)",
  };

  return (
    <button
      onClick={onSelect}
      title={`Page ${index + 1} · ${page.variant}`}
      className="group flex shrink-0 flex-col items-center gap-1.5 outline-none"
    >
      <div
        className={cn(
          "rounded-md p-0.5 transition-all duration-200",
          selected
            ? "bg-gradient-to-br from-violet-400 to-indigo-500 shadow-lg shadow-indigo-900/40"
            : "bg-white/5 group-hover:bg-white/15"
        )}
      >
        <div style={stageStyle}>
          {/* `preview` keeps the editor's page strip non-interactive — the
              image/video pop-out only belongs inside the 3D book viewer. */}
          <PageView page={page} theme={theme} preview />
        </div>
      </div>
      <span
        className={cn(
          "text-[10px] font-medium tabular-nums transition-colors",
          selected ? "text-violet-300" : "text-slate-500 group-hover:text-slate-300"
        )}
      >
        {index + 1}
      </span>
    </button>
  );
}
