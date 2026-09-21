"use client";

import { ShieldCheck } from "lucide-react";

export interface Filters {
  htcOnly: boolean;
  bhk: string[];
  propertyType: string[];
  furnishing: string[];
  amenities: string[];
  tenantPref: string[];
  petFriendly: boolean;
  parking: boolean;
}

const BHK_OPTIONS = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK"];
const PROPERTY_TYPES = ["Apartment", "Independent house", "Villa"];
const FURNISHING = ["Unfurnished", "Semi-furnished", "Fully furnished"];
const AMENITIES = ["Gym", "Pool", "Clubhouse", "Power backup", "Children's play area"];
const TENANT_PREF = ["Family", "Bachelors", "Company lease"];

function toggle(list: string[], value: string) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function CheckboxGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="border-b border-border-subtle py-5">
      <h3 className="text-title-md font-semibold text-text-primary">{label}</h3>
      <div className="mt-3 flex flex-col gap-2">
        {options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-body-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="h-4 w-4 rounded border-border-strong text-red-600 focus:ring-red-600 accent-red-600"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export function FilterRail({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  return (
    <div>
      <label className="flex items-start gap-3 rounded-xl border border-green-200 bg-green-100/70 p-4 cursor-pointer shadow-sm">
        <input
          type="checkbox"
          checked={filters.htcOnly}
          onChange={(e) => onChange({ ...filters, htcOnly: e.target.checked })}
          className="mt-0.5 h-4 w-4 rounded border-green-600 text-green-700 focus:ring-green-600 accent-green-700"
        />
        <span>
          <span className="flex items-center gap-1.5 text-body-sm font-semibold text-green-800">
            <ShieldCheck className="h-4 w-4 text-green-700" /> Only HTC-managed communities
          </span>
          <span className="mt-1 block text-body-sm text-ink-700">
            Verified by our on-site team, with real maintenance costs and confirmed availability.
          </span>
        </span>
      </label>

      <div className="mt-2">
        <div className="border-b border-border-subtle py-5">
          <h3 className="text-title-md font-semibold text-text-primary">Budget</h3>
          <div className="mt-3 flex items-center gap-2">
            <input
              type="text"
              placeholder="Min ₹"
              aria-label="Minimum budget"
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-body-sm focus:border-red-600 focus:outline-none"
            />
            <span className="text-text-tertiary">–</span>
            <input
              type="text"
              placeholder="Max ₹"
              aria-label="Maximum budget"
              className="w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-body-sm focus:border-red-600 focus:outline-none"
            />
          </div>
          <p className="mt-2 text-body-sm text-text-tertiary">Rent only. We show maintenance separately on every listing.</p>
        </div>

        <CheckboxGroup label="BHK" options={BHK_OPTIONS} selected={filters.bhk} onToggle={(v) => onChange({ ...filters, bhk: toggle(filters.bhk, v) })} />
        <CheckboxGroup
          label="Property type"
          options={PROPERTY_TYPES}
          selected={filters.propertyType}
          onToggle={(v) => onChange({ ...filters, propertyType: toggle(filters.propertyType, v) })}
        />
        <CheckboxGroup
          label="Furnishing"
          options={FURNISHING}
          selected={filters.furnishing}
          onToggle={(v) => onChange({ ...filters, furnishing: toggle(filters.furnishing, v) })}
        />

        <div className="border-b border-border-subtle py-5">
          <h3 className="text-title-md font-semibold text-text-primary">Availability</h3>
          <select
            aria-label="Availability"
            className="mt-3 w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-body-sm focus:border-red-600 focus:outline-none"
          >
            <option>Any time</option>
            <option>Immediate</option>
            <option>Within 30 days</option>
          </select>
        </div>

        <div className="border-b border-border-subtle py-5">
          <h3 className="text-title-md font-semibold text-text-primary">Community</h3>
          <input
            type="text"
            placeholder="Start typing a community"
            aria-label="Community name"
            className="mt-3 w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-body-sm focus:border-red-600 focus:outline-none"
          />
        </div>

        <CheckboxGroup label="Amenities" options={AMENITIES} selected={filters.amenities} onToggle={(v) => onChange({ ...filters, amenities: toggle(filters.amenities, v) })} />
        <CheckboxGroup label="Tenant preference" options={TENANT_PREF} selected={filters.tenantPref} onToggle={(v) => onChange({ ...filters, tenantPref: toggle(filters.tenantPref, v) })} />

        <div className="border-b border-border-subtle py-5">
          <h3 className="text-title-md font-semibold text-text-primary">Floor</h3>
          <select
            aria-label="Floor preference"
            className="mt-3 w-full rounded-md border border-border-subtle bg-white px-3 py-2 text-body-sm focus:border-red-600 focus:outline-none"
          >
            <option>Any floor</option>
            <option>Ground</option>
            <option>1–5</option>
            <option>6+</option>
          </select>
        </div>

        <div className="flex flex-col gap-2 py-5">
          <label className="flex items-center gap-2 text-body-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={filters.parking}
              onChange={(e) => onChange({ ...filters, parking: e.target.checked })}
              className="h-4 w-4 rounded border-border-strong text-red-600 focus:ring-red-600 accent-red-600"
            />
            Parking
          </label>
          <label className="flex items-center gap-2 text-body-sm text-text-secondary cursor-pointer">
            <input
              type="checkbox"
              checked={filters.petFriendly}
              onChange={(e) => onChange({ ...filters, petFriendly: e.target.checked })}
              className="h-4 w-4 rounded border-border-strong text-red-600 focus:ring-red-600 accent-red-600"
            />
            Pet friendly
          </label>
        </div>
      </div>
    </div>
  );
}
