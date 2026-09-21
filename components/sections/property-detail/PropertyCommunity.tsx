const ROWS = [
  { label: "Managed by HTC since", value: "March 2024" },
  { label: "Homes in community", value: "248" },
  { label: "Amenities", value: "Gym · Pool · Clubhouse · Children's play area · Power backup" },
  { label: "Visitor entry", value: "Digital, app-approved" },
  { label: "Average complaint resolution", value: "18 hours" },
  { label: "Security", value: "24×7, 6 guards per shift" },
];

export function PropertyCommunity() {
  return (
    <div>
      <h2 className="text-title-lg font-semibold text-text-primary">The community</h2>
      <div className="mt-4 divide-y divide-border-subtle rounded-lg border border-border-subtle">
        {ROWS.map((row) => (
          <div key={row.label} className="grid grid-cols-1 gap-1 p-4 sm:grid-cols-[220px_1fr] sm:items-center">
            <span className="text-body-sm text-text-tertiary">{row.label}</span>
            <span className="text-body-md font-medium text-text-primary">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
