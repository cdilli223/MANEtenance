/**
 * ReportStore that writes each report to its own .txt file.
 *
 * FOR LOCAL TESTING ONLY. It writes to the server's disk, which does not
 * work on most hosts (e.g. Vercel's filesystem is read-only). Replace it
 * with a Supabase store before deploying. See store.ts.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Report } from "./report";
import type { ReportStore } from "./store";

/** reporting_tests/ at the project root (the directory `npm run dev` is started from). */
export const DEFAULT_REPORT_DIR = path.join(process.cwd(), "reporting_tests");

// Width of the "Description: " label, used to indent continuation lines.
const LABEL_WIDTH = "Description: ".length;

/**
 * Renders a report as human-readable text, one "Label: value" per line.
 * Multi-line descriptions are indented under their label so every line
 * that starts at column 0 is always a label.
 */
export function formatReport(report: Report): string {
  const description = (report.description ?? "(none)").replace(/\n/g, "\n" + " ".repeat(LABEL_WIDTH));
  return [
    `Report ID:   ${report.id}`,
    `Submitted:   ${report.createdAt}`,
    `Name:        ${report.name}`,
    `UNI:         ${report.uni}`,
    `Location:    ${report.locationName} (${report.locationId})`,
    `Appliance:   ${report.appliance}`,
    `Description: ${description}`,
    "",
  ].join("\n");
}

/**
 * Creates a store that saves reports as files in `dir` (created if missing).
 * Files are named `<timestamp>_<uni>_<first 8 chars of id>.txt`, so they sort
 * chronologically in a file browser.
 */
export function createLocalReportStore(dir: string = DEFAULT_REPORT_DIR): ReportStore {
  return {
    async save(report) {
      await mkdir(dir, { recursive: true });
      // Colons aren't allowed in filenames on Windows/macOS Finder, so
      // 2026-11-19T19:15:14.510Z becomes 2026-11-19T19-15-14-510Z.
      const timestamp = report.createdAt.replace(/[:.]/g, "-");
      // `uni` is safe in a filename: createReport() restricts it to letters + digits.
      const filePath = path.join(dir, `${timestamp}_${report.uni}_${report.id.slice(0, 8)}.txt`);
      // The "wx" flag fails instead of silently overwriting an existing file.
      await writeFile(filePath, formatReport(report), { encoding: "utf8", flag: "wx" });
      return filePath;
    },
  };
}
