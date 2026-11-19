/**
 * Placeholder map: a blank square with one clickable point per location in
 * lib/locations.ts. Clicking a point opens that location's report page.
 *
 * To use a real map later: put a floor plan or campus image (or a map
 * library) inside the square. The points use percentage positions, so they
 * stay put as the square resizes; just set each location's x/y to match
 * the image.
 */
import Link from "next/link";
import { LOCATIONS } from "@/lib/locations";

export function ReportMap() {
  return (
    // `relative` makes this the positioning frame for the absolutely
    // positioned points; `aspect-square` keeps it square at any width.
    <div className="relative aspect-square w-full max-w-lg border border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-900">
      {LOCATIONS.map((l) => (
        // The link is a 40px invisible tap target (comfortable on phones),
        // centered on (x%, y%) by the -translate-1/2 classes. The visible
        // dot is the smaller span inside it.
        <Link
          key={l.id}
          href={`/report/${l.id}`}
          aria-label={`Report a problem at ${l.name}`}
          title={l.name}
          style={{ left: `${l.x}%`, top: `${l.y}%` }}
          className="group absolute flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus-visible:outline-2 focus-visible:outline-red-600"
        >
          <span className="h-4 w-4 rounded-full bg-red-600 ring-4 ring-red-600/20 transition-transform group-hover:scale-125" />
        </Link>
      ))}
    </div>
  );
}
