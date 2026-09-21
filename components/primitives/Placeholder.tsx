import Image from "next/image";
import { ImageIcon } from "lucide-react";
import availableImagesList from "@/lib/available-images.json";

export type AspectRatioType =
  | "16/9"
  | "4/3"
  | "1/1"
  | "3/4"
  | "21/9"
  | "4/5"
  | "16/10"
  | (string & {});

export interface PlaceholderProps {
  /** Must match a row in docs/IMAGE-MANIFEST.md */
  id: string;
  ratio: AspectRatioType;
  label: string;
  className?: string;
  variant?: "default" | "dark" | "subtle" | "sequence" | "borderless";
  priority?: boolean;
  sizes?: string;
}

const variantStyles: Record<NonNullable<PlaceholderProps["variant"]>, string> = {
  default: "bg-surface-sunken border border-dashed border-border-strong text-text-tertiary",
  dark: "bg-surface-brand border border-dashed border-red-700 text-white",
  subtle: "bg-surface-page border border-dashed border-border-subtle text-text-tertiary",
  sequence: "bg-surface-sunken border-0 text-text-tertiary",
  borderless: "bg-surface-sunken border-0 text-text-tertiary",
};

// Index available images by ID for O(1) lookup
interface AvailableImageItem {
  id: string;
  path: string;
  generated?: boolean;
  focal?: { x: number; y: number };
}

const imageMap: Record<string, AvailableImageItem> = {};
for (const item of (availableImagesList as AvailableImageItem[])) {
  imageMap[item.id] = item;
}

/**
 * Renders a clean, labelled, correctly-proportioned empty frame in place of
 * a photo, OR renders the actual image if placed in /public/sequences/<id>.jpg.
 */
export function Placeholder({
  id,
  ratio,
  label,
  className = "",
  variant = "default",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: PlaceholderProps) {
  const imageItem = imageMap[id];
  const isStandin = imageItem?.generated === true;
  const showBadge =
    process.env.NEXT_PUBLIC_SHOW_STANDIN_BADGE === "true" ||
    (process.env.NODE_ENV !== "production" && isStandin);

  if (imageItem?.path) {
    const focalX = (imageItem.focal?.x ?? 0.5) * 100;
    const focalY = (imageItem.focal?.y ?? 0.5) * 100;

    return (
      <div
        data-placeholder
        data-placeholder-id={id}
        className={`relative flex w-full items-center justify-center overflow-hidden rounded-lg ${className}`}
        style={{ aspectRatio: ratio.replace("/", " / ") }}
      >
        <Image
          src={imageItem.path}
          alt={label}
          fill
          sizes={sizes}
          priority={priority}
          style={{ objectPosition: `${focalX}% ${focalY}%` }}
          className="object-cover rounded-lg transition-opacity duration-300"
        />
        {showBadge && (
          <span
            data-standin-badge
            className="absolute bottom-2 left-2 z-10 rounded-full bg-[rgba(23,20,15,0.65)] px-2.5 py-0.5 font-sans text-xs font-medium text-white backdrop-blur-sm pointer-events-none shadow-sm"
          >
            Sample image
          </span>
        )}
      </div>
    );
  }

  const isDecorative = !label || label.trim() === "";

  return (
    <div
      data-placeholder
      data-placeholder-id={id}
      {...(isDecorative ? { "aria-hidden": "true" as const } : { role: "img" as const, "aria-label": label })}
      className={`relative flex w-full items-center justify-center overflow-hidden rounded-lg ${variantStyles[variant]} ${className}`}
      style={{ aspectRatio: ratio.replace("/", " / ") }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 12px)",
        }}
      />
      <div className="relative flex flex-col items-center gap-2 px-4 text-center">
        <ImageIcon className="h-6 w-6 opacity-60" strokeWidth={1.5} />
        <span className="font-sans text-label uppercase tracking-[0.08em] opacity-70">{id}</span>
        <span className="max-w-[24ch] text-body-sm leading-snug opacity-70">{label}</span>
      </div>
    </div>
  );
}
