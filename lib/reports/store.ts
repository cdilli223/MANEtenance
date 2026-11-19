import type { Report } from "./report";

/**
 * Where reports get saved.
 *
 * Code that submits reports (app/report/actions.ts) depends only on this
 * interface, not on a specific backend:
 *   - localReportStore.ts: writes .txt files to reporting_tests/ (current, for testing)
 *   - a Supabase store: TODO. Implement `save` with an insert into a
 *     `reports` table, then swap it in at the top of app/report/actions.ts.
 */
export interface ReportStore {
  /**
   * Persists an already-validated report.
   * @returns where it was stored (a file path, a database row id, ...), for logging.
   * @throws if the report could not be saved.
   */
  save(report: Report): Promise<string>;
}
