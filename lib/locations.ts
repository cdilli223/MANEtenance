/**
 * Reportable locations, shown as clickable points on the map (app/ReportMap.tsx).
 *
 * This list is the single source of truth for "where can things break and
 * what can break there":
 *   - the map draws one point per entry,
 *   - /report/[id] is generated for each entry,
 *   - the report form's dropdown lists that entry's `appliances`,
 *   - createReport() rejects any location/appliance not listed here.
 *
 * HOW TO ADD A LOCATION: append an object below. `id` appears in the URL
 * (/report/<id>) and in saved reports, so keep it lowercase-with-dashes and
 * don't rename it once reports exist. `name` is the human-readable label
 * and is safe to change.
 */
export type MapLocation = {
  /** URL-safe, stable identifier, e.g. "main-building". */
  id: string;
  /** Display name, e.g. "Main Building". */
  name: string;
  /**
   * Position on the map as a percentage of its width (x) and height (y),
   * from the top-left corner: (0, 0) is top-left, (50, 50) is the center.
   * Percentages keep points in place when the map resizes.
   */
  x: number;
  y: number;
  /** Appliances users can report at this location (the form's dropdown options). */
  appliances: readonly string[];
};

export const LOCATIONS: readonly MapLocation[] = [
  {
    id: "main-building",
    name: "Main Building",
    x: 50,
    y: 50,
    appliances: ["1st floor printer", "2nd floor printer", "3rd floor printer"],
  },
];

/** Looks up a location by id. Returns undefined for unknown ids (e.g. a mistyped URL). */
export function getLocation(id: string): MapLocation | undefined {
  return LOCATIONS.find((l) => l.id === id);
}
