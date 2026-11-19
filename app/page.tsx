/**
 * Home page (/): the map. Users pick a location here, which takes them to
 * /report/<locationId> to fill out a report.
 */
import { ReportMap } from "./ReportMap";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 bg-zinc-50 px-4 py-16 font-sans text-black dark:bg-black dark:text-zinc-50">
      <h1 className="text-2xl font-semibold">Select a location to report a problem</h1>
      <ReportMap />
    </main>
  );
}
