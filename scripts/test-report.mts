/**
 * Smoke test for the report factory + local store, without the web UI.
 *
 *   npm run report:test
 *
 * Writes the valid samples below to reporting_tests/ and prints the
 * validation errors for the invalid one. Edit `samples` to try other input.
 * Note: the files it creates are real and are not cleaned up automatically.
 *
 * This file is ".mts" (ES module TypeScript) so Node 22.18+ can run it
 * directly with no build step. That's also why its imports end in ".ts".
 */
import { createReport, ReportValidationError } from "../lib/reports/report.ts";
import { createLocalReportStore } from "../lib/reports/localReportStore.ts";

const store = createLocalReportStore();

const samples = [
  {
    name: "Jane Doe",
    uni: "jd1234",
    locationId: "main-building",
    appliance: "3rd floor printer",
    description: "Paper jam in tray 2.\r\nShows error E-104.", // multi-line, Windows line ending
  },
  // Optional description omitted; uppercase UNI gets lowercased.
  { name: "John Smith", uni: "JS567", locationId: "main-building", appliance: "1st floor printer" },
  // Invalid on purpose: shows validation reporting every problem at once.
  { name: "", uni: "not-a-uni", locationId: "main-building", appliance: "4th floor printer" },
];

for (const input of samples) {
  try {
    const report = createReport(input);
    const filePath = await store.save(report);
    console.log(`Saved ${report.id} -> ${filePath}`);
  } catch (err) {
    if (err instanceof ReportValidationError) {
      console.log(`Rejected: ${err.issues.join("; ")}`);
    } else {
      throw err; // unexpected (e.g. disk error): crash loudly
    }
  }
}
