"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import availableImagesList from "@/lib/available-images.json";
import { Placeholder } from "@/components/primitives/Placeholder";

interface AvailableImageItem {
  id: string;
  path: string;
  generated?: boolean;
  focal?: { x: number; y: number };
}

const imageMap: Record<string, AvailableImageItem> = {};
for (const item of availableImagesList as AvailableImageItem[]) {
  imageMap[item.id] = item;
}

export interface SiteImageProps {
  id: string;
  alt: string;
  fill?: boolean;
  focal?: { x: number; y: number };
  sizes?: string;
  priority?: boolean;
  fetchPriority?: "high" | "low" | "auto";
  loading?: "eager" | "lazy";
  thumbnail?: boolean;
  draggable?: boolean;
  className?: string;
  badgePosition?: "bottom-left" | "top-left";
  onDecoded?: () => void;
}

export function SiteImage({
  id,
  alt,
  fill = true,
  focal,
  sizes = "(min-width: 1024px) 560px, 100vw",
  priority = false,
  fetchPriority,
  loading,
  thumbnail = false,
  draggable = false,
  className = "object-cover",
  badgePosition = "bottom-left",
  onDecoded,
}: SiteImageProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imageItem = imageMap[id];
  const isStandin = imageItem?.generated === true;
  const showBadge = !thumbnail && process.env.NEXT_PUBLIC_SHOW_STANDIN_BADGE === "true";

  const focalX = (focal?.x ?? imageItem?.focal?.x ?? 0.5) * 100;
  const focalY = (focal?.y ?? imageItem?.focal?.y ?? 0.5) * 100;

  useEffect(() => {
    if (!onDecoded) return;
    if (!imageItem?.path) {
      onDecoded();
      return;
    }
    const img = imgRef.current;
    if (img && img.complete) {
      if (img.decode) {
        img.decode().then(onDecoded).catch(onDecoded);
      } else {
        onDecoded();
      }
    }
  }, [imageItem, onDecoded]);

  if (!imageItem?.path) {
    return (
      <Placeholder
        id={id}
        ratio="1/1"
        label={alt}
        variant="sequence"
        className="h-full w-full rounded-none"
      />
    );
  }

  const badgePlacementClass =
    badgePosition === "top-left" ? "top-3 left-3" : "bottom-3 left-3";

  return (
    <div className="relative h-full w-full overflow-hidden">
      <Image
        ref={imgRef}
        src={imageItem.path}
        alt={alt}
        fill={fill}
        sizes={thumbnail ? "120px" : sizes}
        priority={priority}
        loading={loading}
        draggable={draggable}
        style={{ objectPosition: `${focalX}% ${focalY}%` }}
        className={`${className} transition-opacity duration-300`}
        onLoad={() => {
          if (onDecoded && imgRef.current?.decode) {
            imgRef.current.decode().then(onDecoded).catch(onDecoded);
          } else if (onDecoded) {
            onDecoded();
          }
        }}
      />
      {showBadge && (
        <span
          data-standin-badge
          className={`absolute ${badgePlacementClass} z-20 rounded-full bg-[rgba(23,20,15,0.65)] px-2.5 py-0.5 font-sans text-xs font-medium text-white backdrop-blur-sm pointer-events-none shadow-sm`}
        >
          Sample image
        </span>
      )}
    </div>
  );
}
