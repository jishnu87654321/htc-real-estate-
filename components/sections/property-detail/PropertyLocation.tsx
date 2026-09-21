import { Placeholder } from "@/components/primitives/Placeholder";

export function PropertyLocation() {
  return (
    <div>
      <h2 className="text-title-lg font-semibold text-text-primary">Location</h2>
      <p className="mt-1 text-body-sm text-text-secondary">Sarvani Heights, Gachibowli, Hyderabad 500032</p>
      <div className="mt-4">
        <Placeholder id="detail-location-map" ratio="16/9" label="Map centred on the property, with nearby landmarks" />
      </div>
    </div>
  );
}
