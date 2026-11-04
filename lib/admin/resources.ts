// Field definitions for the generic admin form. Plain data, so server pages can
// pass it straight to the client form.
export interface ResourceField {
  key: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox" | "datetime";
  options?: string[];
  max?: number;
  wide?: boolean;
}

const STATUS: ResourceField = {
  key: "status",
  label: "status",
  type: "select",
  options: ["draft", "published"],
};

const POSITION: ResourceField = {
  key: "sort",
  label: "position (lower shows first)",
  type: "number",
};

export const EVENT_FIELDS: ResourceField[] = [
  { key: "title", label: "title", type: "text" },
  { key: "slug", label: "slug (lowercase-with-dashes)", type: "text" },
  {
    key: "format",
    label: "format",
    type: "select",
    options: [
      "hackathon",
      "workshop",
      "talk",
      "competition",
      "bootcamp",
      "networking",
      "gaming",
      "other",
    ],
  },
  { key: "edition", label: "date shown on site", type: "text" },
  { key: "summary", label: "summary", type: "textarea", max: 220, wide: true },
  { key: "venue", label: "venue", type: "text" },
  {
    key: "starts_at",
    label: "starts (IST, empty = date tba)",
    type: "datetime",
  },
  { key: "ends_at", label: "ends (IST)", type: "datetime" },
  { key: "attendance", label: "attendance", type: "number" },
  { key: "is_flagship", label: "flagship event", type: "checkbox" },
  STATUS,
];

export const ACHIEVEMENT_FIELDS: ResourceField[] = [
  { key: "title", label: "title", type: "text", wide: true },
  { key: "year", label: "year", type: "number" },
  {
    key: "category",
    label: "category",
    type: "select",
    options: ["hackathon", "entrepreneurship", "innovation", "award", "event"],
  },
  { key: "organizer", label: "organizer", type: "text" },
  { key: "result", label: "result", type: "text" },
  { key: "prize", label: "prize", type: "text" },
  { key: "description", label: "description", type: "textarea", wide: true },
  { key: "is_highlight", label: "highlight (max 3)", type: "checkbox" },
  POSITION,
  STATUS,
];

export const MILESTONE_FIELDS: ResourceField[] = [
  { key: "year_label", label: "year", type: "text" },
  { key: "level", label: "level number", type: "number" },
  { key: "title", label: "title", type: "text", wide: true },
  { key: "description", label: "description", type: "textarea", wide: true },
  { key: "on_home", label: "show on home page", type: "checkbox" },
  POSITION,
  STATUS,
];

/** "2026-11-04T10:30" in IST, for a datetime-local input. */
export function toIstInput(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Kolkata",
    dateStyle: "short",
    timeStyle: "short",
  })
    .format(new Date(iso))
    .replace(" ", "T");
}
