"use client";

import { Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

/**
 * Triggers the browser print dialog (→ "Save as PDF"). The route's scoped
 * `hoe.css` has a `@media print` block that strips the dark chrome into a
 * clean light document, so the printed PDF is recruiter-readable as-is.
 */
export function PrintButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      className="hoe-no-print"
      onClick={() => window.print()}
    >
      <Printer className="size-3.5" />
      Print / Save PDF
    </Button>
  );
}
