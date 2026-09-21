import { Reveal } from "@/components/primitives/Reveal";

export function PropertyAbout() {
  return (
    <div>
      <h2 className="text-title-lg font-semibold text-text-primary">About this home</h2>
      <Reveal>
        <p className="mt-3 max-w-[68ch] text-body-md text-text-secondary">
          A spacious east-facing 3 BHK on the 6th floor, freshly painted with new bathroom fittings installed in
          early 2026. The living and dining areas are open plan with good natural light throughout the morning. The
          kitchen opens to the dining room. Two bedrooms have attached bathrooms and a private balcony; the third
          bedroom faces the building corridor and has a separate bathroom.
        </p>
      </Reveal>
    </div>
  );
}
