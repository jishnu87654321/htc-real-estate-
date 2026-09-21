"use client";

import { useId, useState } from "react";

export function FloatingField({
  label,
  type = "text",
  required = false,
  helper,
}: {
  label: string;
  type?: string;
  required?: boolean;
  helper?: string;
}) {
  const id = useId();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);
  const floated = focused || value.length > 0;

  return (
    <div className="relative">
      <label
        htmlFor={id}
        className={`pointer-events-none absolute left-4 transition-all duration-150 ${
          floated ? "top-1.5 text-label uppercase tracking-[0.04em] text-text-tertiary" : "top-3.5 text-body-md text-text-tertiary"
        }`}
      >
        {label}
        {required ? " *" : ""}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-md border border-border-subtle bg-surface-raised px-4 pb-2.5 pt-6 text-body-md text-text-primary transition-colors duration-150 focus:border-clay-600 focus:outline-none"
      />
      {helper && <p className="mt-1 text-body-sm text-text-tertiary">{helper}</p>}
    </div>
  );
}
