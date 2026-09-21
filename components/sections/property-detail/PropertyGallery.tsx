"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Placeholder } from "@/components/primitives/Placeholder";
import { ease } from "@/lib/motion";

const THUMBS = ["02", "03", "04", "05"];

export function PropertyGallery() {
  const [active, setActive] = useState("01");

  return (
    <div>
      <motion.div layoutId={`gallery-${active}`} transition={ease.spring}>
        <Placeholder id={`detail-gallery-${active}`} ratio="21/9" label="Wide interior or exterior hero shot of the property" />
      </motion.div>
      <div className="mt-3 grid grid-cols-4 gap-3">
        {THUMBS.map((id) => (
          <button key={id} type="button" onClick={() => setActive(id)} className="text-left">
            <motion.div layoutId={active === id ? undefined : `gallery-${id}`} transition={ease.spring}>
              <Placeholder id={`detail-gallery-${id}`} ratio="4/3" label="Room interior, natural light, wide" />
            </motion.div>
          </button>
        ))}
      </div>
    </div>
  );
}
