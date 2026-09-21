import type { Metadata } from "next";
import { JsonLd, breadcrumbSchema } from "@/components/seo/JsonLd";
import { OperationsHero } from "@/components/sections/operations/OperationsHero";
import { OperationsProblemAndFlow } from "@/components/sections/operations/OperationsProblemAndFlow";
import { OperationsCapabilities } from "@/components/sections/operations/OperationsCapabilities";

export const metadata: Metadata = {
  title: "Operations console — HTC",
  description: "Work orders, shift handovers and vendor escalations for the team that runs the building, with an audit trail the next committee can read.",
};

export default function OperationsPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "https://www.htc.example/" },
          { name: "Operations", url: "https://www.htc.example/operations" },
        ])}
      />
      <OperationsHero />
      <OperationsProblemAndFlow />
      <OperationsCapabilities />
    </>
  );
}
