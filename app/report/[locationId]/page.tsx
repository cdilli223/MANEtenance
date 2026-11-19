/**
 * Report page for a single map location: /report/<locationId>
 * (e.g. /report/main-building). Users land here by clicking a point on the map.
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocation, LOCATIONS } from "@/lib/locations";
import { ReportForm } from "./ReportForm";

/** Pre-renders one page per known location at build time. */
export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ locationId: l.id }));
}

export default async function ReportPage(props: PageProps<"/report/[locationId]">) {
  // In this Next.js version `params` is a Promise and must be awaited.
  const { locationId } = await props.params;
  const location = getLocation(locationId);
  // Unknown id (e.g. a mistyped URL) shows Next's "not found" page.
  // Note: with Cache Components enabled this streams with HTTP 200 + noindex,
  // not a 404 status. That's expected; see Next's notFound() docs.
  if (!location) notFound();

  return (
    <main className="flex flex-1 flex-col items-center gap-6 bg-zinc-50 px-4 py-16 font-sans text-black dark:bg-black dark:text-zinc-50">
      <Link href="/" className="self-start text-sm text-zinc-600 underline sm:self-center dark:text-zinc-400">
        ← Back to map
      </Link>
      <h1 className="text-2xl font-semibold">Report a problem at {location.name}</h1>
      <ReportForm locationId={location.id} appliances={location.appliances} />
    </main>
  );
}
