/**
 * The report form. A Client Component because it uses useActionState to show
 * the result of each submission (success message or validation errors)
 * without a full page reload.
 *
 * The form still works with JavaScript disabled: React falls back to a
 * normal form POST to the same Server Action.
 */
"use client";

import { useActionState } from "react";
import { submitReport, type SubmitReportState } from "../actions";
import { DESCRIPTION_MAX_LENGTH, NAME_MAX_LENGTH } from "@/lib/reports/report";

const initialState: SubmitReportState = { status: "idle", message: "" };

// Shared styling for all text inputs, the dropdown and the textarea.
const inputClass =
  "w-full rounded border border-zinc-300 bg-white px-3 py-2 text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

type Props = {
  /** Which location this report is for. Submitted as a hidden field. */
  locationId: string;
  /** Options for the "Broken printer" dropdown, from lib/locations.ts. */
  appliances: readonly string[];
};

export function ReportForm({ locationId, appliances }: Props) {
  // state:      latest SubmitReportState returned by submitReport
  // formAction: pass to <form action>; calls submitReport with the form data
  // pending:    true while a submission is in flight (disables the button)
  const [state, formAction, pending] = useActionState(submitReport, initialState);

  // React clears the form after each submission. On error, the action sends
  // back what was typed; feeding it into `defaultValue` restores the fields.
  // On success `values` is undefined, so the form comes back empty.
  const v = state.values;

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-4">
      {/* Not user-editable, but still re-validated on the server since anyone can change it. */}
      <input type="hidden" name="locationId" value={locationId} />

      {/* `required` / `maxLength` only give users quick feedback; the real checks are in createReport(). */}
      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Name</span>
        <input name="name" required maxLength={NAME_MAX_LENGTH} defaultValue={v?.name} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">UNI</span>
        <input name="uni" required placeholder="abc1234" defaultValue={v?.uni} className={inputClass} />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">Broken printer</span>
        {/* Unlike text inputs, a <select> doesn't pick up a changed defaultValue,
            so changing `key` remounts it to show the restored choice after an error. */}
        <select
          key={v?.appliance ?? ""}
          name="appliance"
          required
          defaultValue={v?.appliance ?? ""}
          className={inputClass}
        >
          {/* Placeholder: value="" + disabled means `required` blocks submitting without a choice. */}
          <option value="" disabled>
            Select a printer
          </option>
          {appliances.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm font-medium">
          Description <span className="font-normal text-zinc-500">(optional)</span>
        </span>
        <textarea
          name="description"
          rows={3}
          maxLength={DESCRIPTION_MAX_LENGTH}
          defaultValue={v?.description}
          className={inputClass}
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-black px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-black"
      >
        {pending ? "Submitting…" : "Submit report"}
      </button>

      {/* aria-live makes screen readers announce the result when it appears. */}
      <p
        aria-live="polite"
        className={
          state.status === "error"
            ? "text-sm text-red-600 dark:text-red-400"
            : "text-sm text-green-700 dark:text-green-400"
        }
      >
        {state.message}
      </p>
    </form>
  );
}
