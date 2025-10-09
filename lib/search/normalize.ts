export function normalizeText(s: string | null | undefined): string {
  if (!s) return "";
  return s.toString().trim().toLowerCase();
}

const NYC = ["nyc", "new york", "manhattan", "brooklyn", "queens", "bronx", "staten island"];
const SF = [
  "sf",
  "san francisco",
  "bay area",
  "san mateo",
  "palo alto",
  "san jose",
  "oakland",
  "berkeley",
  "mountain view",
  "menlo park",
  "redwood city",
  "cupertino",
  "sunnyvale",
  "santa clara",
  "fremont",
];

export function normalizeLocation(loc: string | null | undefined): string {
  const s = normalizeText(loc);
  if (!s) return "";
  if (/remote|wfh|work from home|distributed/.test(s)) return "remote";
  if (NYC.some((k) => s.includes(k))) return "new york";
  if (SF.some((k) => s.includes(k))) return "san francisco";
  if (/toronto|gta|mississauga|scarborough|north york|etobicoke|markham|vaughan|richmond hill|brampton/.test(s))
    return "toronto";
  return s;
}

export function normalizeJob<T extends { position: string; company: string; location: string | null | undefined }>(j: T) {
  return {
    ...j,
    positionN: normalizeText(j.position),
    companyN: normalizeText(j.company),
    locationN: normalizeLocation(j.location),
  };
}

