/**
 * Server Action that handles report form submissions.
 *
 * "use server" makes every exported async function here callable from the
 * browser as a POST endpoint. Treat all arguments as untrusted input:
 * anyone can call it directly, not just through our form. That's why all
 * validation lives in createReport() rather than in the form.
 *
 * TODO: before going live, verify who the user is here (e.g. Supabase auth)
 * instead of trusting the name/UNI typed into the form.
 */
"use server";

import { createReport, ReportValidationError, type ReportInput } from "@/lib/reports/report";
import { createLocalReportStore } from "@/lib/reports/localReportStore";

// The one place that decides where reports are saved. Swap this for a
// Supabase-backed ReportStore later; nothing else needs to change.
const store = createLocalReportStore();

/** What the action returns to the form after each submission (read via useActionState). */
export type SubmitReportState = {
  status: "idle" | "success" | "error";
  /** Shown under the submit button. */
  message: string;
  /**
   * Sent back only on error so the form can refill what the user typed.
   * (React clears the form after every submission.)
   */
  values?: ReportInput;
};

/**
 * Validates and saves a report from the form's FormData.
 *
 * The signature (previousState, formData) is required by React's
 * useActionState. We don't need the previous state, hence `_prev`.
 * Expected form fields: name, uni, locationId, appliance, description.
 */
export async function submitReport(
  _prev: SubmitReportState,
  formData: FormData,
): Promise<SubmitReportState> {
  // formData.get() returns null for missing fields; String() normalizes to "".
  const values: ReportInput = {
    name: String(formData.get("name") ?? ""),
    uni: String(formData.get("uni") ?? ""),
    locationId: String(formData.get("locationId") ?? ""),
    appliance: String(formData.get("appliance") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  try {
    const report = createReport(values);
    await store.save(report);
    return { status: "success", message: `Report submitted. Reference: ${report.id.slice(0, 8)}` };
  } catch (err) {
    // Bad input: show the user exactly what to fix.
    if (err instanceof ReportValidationError) {
      return { status: "error", message: err.issues.join("; "), values };
    }
    // Anything else (disk/database failure) is our fault. Log the details on
    // the server, but don't leak internals to the user.
    console.error("Failed to save report", err);
    return { status: "error", message: "Something went wrong saving your report.", values };
  }
}
