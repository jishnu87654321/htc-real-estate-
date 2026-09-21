"use client";

import { useState } from "react";
import { ScrollSequence, type SequenceFrame } from "@/components/primitives/ScrollSequence";

const DETAIL_ROOMS_FRAMES: SequenceFrame[] = [
  {
    id: "detail-rooms-seq-01",
    label: "Living room, wide, from the entrance",
    caption: "Living & Dining (22' × 14')",
  },
  {
    id: "detail-rooms-seq-02",
    label: "Kitchen, wide",
    caption: "Modular Kitchen (10' × 11')",
  },
  {
    id: "detail-rooms-seq-03",
    label: "Primary bedroom",
    caption: "Master Bedroom (14' × 16')",
  },
  {
    id: "detail-rooms-seq-04",
    label: "Bathroom",
    caption: "En-suite Bathroom (8' × 6')",
  },
  {
    id: "detail-rooms-seq-05",
    label: "Balcony view outward",
    caption: "East-facing Balcony (12' × 5')",
  },
];

const ROOM_HOTSPOTS = [
  { id: 0, name: "Living Room", x: 120, y: 110, w: 110, h: 90 },
  { id: 1, name: "Kitchen", x: 245, y: 65, w: 85, h: 70 },
  { id: 2, name: "Master Bedroom", x: 60, y: 65, w: 75, h: 80 },
  { id: 3, name: "En-suite Bath", x: 60, y: 155, w: 60, h: 50 },
  { id: 4, name: "Balcony", x: 120, y: 210, w: 110, h: 35 },
];

export function PropertyFloorPlan() {
  const [activeRoom, setActiveRoom] = useState(0);

  return (
    <div>
      <h2 className="text-title-lg font-semibold text-text-primary">Interactive 2D Floor Plan & Room Views</h2>
      <p className="mt-1 text-body-sm text-text-secondary">
        Click any room hotspot on the architectural blueprint to jump to its interior view.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12 items-center">
        {/* 2D Architectural SVG Floor Plan with Clickable Hotspots */}
        <div className="lg:col-span-5 rounded-xl border border-border-subtle bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2 mb-3">
            <span className="font-mono text-label uppercase tracking-wider text-ink-400">Unit 804 · Type A · 1,450 sq ft</span>
            <span className="text-label text-red-600 font-medium">Click room to inspect</span>
          </div>

          <svg viewBox="0 0 350 260" className="w-full h-auto select-none" aria-label="Interactive 2D floor plan blueprint">
            {/* Outer structural walls */}
            <rect x="20" y="20" width="310" height="220" fill="#FDFCFB" stroke="var(--ink-900)" strokeWidth="3" rx="4" />
            
            {/* Interior wall divisions */}
            <line x1="140" y1="20" x2="140" y2="150" stroke="var(--ink-600)" strokeWidth="2" />
            <line x1="240" y1="20" x2="240" y2="150" stroke="var(--ink-600)" strokeWidth="2" />
            <line x1="20" y1="150" x2="240" y2="150" stroke="var(--ink-600)" strokeWidth="2" />
            <line x1="140" y1="200" x2="240" y2="200" stroke="var(--ink-600)" strokeWidth="2" />

            {/* Room Boxes & Clickable Areas */}
            {ROOM_HOTSPOTS.map((room) => {
              const isSelected = activeRoom === room.id;
              return (
                <g
                  key={room.id}
                  onClick={() => setActiveRoom(room.id)}
                  className="cursor-pointer group"
                >
                  <rect
                    x={room.x - room.w / 2}
                    y={room.y - room.h / 2}
                    width={room.w}
                    height={room.h}
                    fill={isSelected ? "rgba(181, 45, 32, 0.08)" : "transparent"}
                    className="transition-colors duration-150 group-hover:fill-red-50"
                  />
                  <text
                    x={room.x}
                    y={room.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className={`font-sans text-[11px] font-medium transition-colors ${
                      isSelected ? "fill-red-700 font-semibold" : "fill-ink-600 group-hover:fill-ink-900"
                    }`}
                  >
                    {room.name}
                  </text>
                  {/* Interactive Hotspot Dot */}
                  <circle
                    cx={room.x}
                    cy={room.y + 14}
                    r={isSelected ? 5 : 3.5}
                    className={`transition-all ${
                      isSelected ? "fill-red-600 stroke-red-200" : "fill-paper-300 group-hover:fill-red-500"
                    }`}
                    strokeWidth={isSelected ? 3 : 1}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Room View Sequence */}
        <div className="lg:col-span-7">
          <ScrollSequence
            id="detail-rooms-seq"
            frames={DETAIL_ROOMS_FRAMES}
            mode="crossfade"
            ratio="16/10"
            sticky={false}
            activeFrameIndex={activeRoom}
            onFrameSelect={setActiveRoom}
            className="w-full"
          />
        </div>
      </div>

      <p className="mt-4 text-body-sm text-text-secondary">
        3 BHK, 1,450 sq ft: living and dining facing east, kitchen adjoining the dining area, two bedrooms with
        attached bathrooms and one with a balcony, a third bedroom facing the corridor, and a utility balcony off the
        kitchen.
      </p>
    </div>
  );
}
