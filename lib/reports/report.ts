/**
 * Report model + factory.
 *
 * `createReport` is the ONLY place raw user input becomes a `Report`. It
 * validates and normalizes the input so every storage backend (local .txt
 * files now, Supabase later) receives the same well-formed shape. Never build
 * a `Report` object by hand; always go through `createReport`.
 *
 * Validation here is the real security boundary. The form's `required` /
 * `maxLength` attributes are just a convenience for users and can be
 * bypassed by anyone sending a request directly.
 */

// The explicit ".ts" extension lets scripts/test-report.mts run this file
// directly with Node (which requires extensions). Next.js accepts it too,
// thanks to `allowImportingTsExtensions` in tsconfig.json.
import { getLocation } from "../locations.ts";

/** A validated, ready-to-store report. */
export type Report = {
  /** Random UUID assigned at creation. The first 8 chars are shown to the user as a reference. */
  id: string;
  name: string;
  /** University ID, e.g. "abc1234". Always stored lowercase. */
  uni: string;
  /** Stable id of the map location the report was filed from, e.g. "main-building". */
  locationId: string;
  /**
   * Location display name at the time of the report. Stored alongside the id
   * so old reports stay readable even if the location is renamed later.
   */
  locationName: string;
  /** The broken appliance at that location, e.g. "3rd floor printer". */
  appliance: string;
  /** Optional free-text details. May span multiple lines. */
  description?: string;
  /** ISO-8601 UTC timestamp of when the report was created. */
  createdAt: string;
};

/** Raw, untrusted input, e.g. straight from a form submission. */
export type ReportInput = {
  name: string;
  uni: string;
  locationId: string;
  appliance: string;
  description?: string;
};

// Exported so the form can mirror these limits with `maxLength`.
export const NAME_MAX_LENGTH = 100;
export const DESCRIPTION_MAX_LENGTH = 500;

// Columbia UNIs are 2–3 letters (initials) followed by 1–4 digits,
// e.g. "ab123" or "abc1234". Checked after lowercasing.
// This also guarantees the UNI is safe to use in a filename.
const UNI_PATTERN = /^[a-z]{2,3}\d{1,4}$/;

/**
 * Thrown by `createReport` when input is invalid. `issues` lists every
 * problem found (not just the first) so they can all be shown at once.
 */
export class ReportValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(`Invalid report: ${issues.join("; ")}`);
    this.name = "ReportValidationError";
    this.issues = issues;
  }
}

/**
 * Validates and normalizes raw input into a `Report`.
 *
 * Normalization: trims all fields, collapses whitespace in the name to single
 * spaces (no line breaks), lowercases the UNI, converts Windows line endings
 * in the description to "\n", and turns an empty description into undefined.
 *
 * @throws {ReportValidationError} if any field is invalid.
 */
export function createReport(input: ReportInput): Report {
  // `?.` / `?? ""` guard against missing fields when called from untyped code.
  const name = input.name?.replace(/\s+/g, " ").trim() ?? "";
  const uni = input.uni?.trim().toLowerCase() ?? "";
  const locationId = input.locationId?.trim() ?? "";
  const appliance = input.appliance?.trim() ?? "";
  // Browsers submit textarea newlines as "\r\n" but count them as one
  // character for `maxLength`. Normalizing first keeps both limits in sync.
  const description = input.description?.replace(/\r\n?/g, "\n").trim() || undefined;
  const location = getLocation(locationId);

  const issues: string[] = [];
  if (!name) issues.push("name is required");
  else if (name.length > NAME_MAX_LENGTH) {
    issues.push(`name must be ${NAME_MAX_LENGTH} characters or fewer`);
  }
  if (!uni) issues.push("UNI is required");
  else if (!UNI_PATTERN.test(uni)) issues.push(`UNI "${uni}" is not a valid UNI`);
  if (!location) issues.push(`"${locationId}" is not a known location`);
  if (!appliance) issues.push("appliance is required");
  else if (location && !location.appliances.includes(appliance)) {
    issues.push(`"${appliance}" is not an appliance at ${location.name}`);
  }
  if (description && description.length > DESCRIPTION_MAX_LENGTH) {
    issues.push(`description must be ${DESCRIPTION_MAX_LENGTH} characters or fewer`);
  }
  // `!location` is already covered by `issues`, but repeating it here lets
  // TypeScript know `location` is defined below.
  if (issues.length > 0 || !location) throw new ReportValidationError(issues);

  return {
    id: crypto.randomUUID(),
    name,
    uni,
    locationId: location.id,
    locationName: location.name,
    appliance,
    description,
    createdAt: new Date().toISOString(),
  };
}
