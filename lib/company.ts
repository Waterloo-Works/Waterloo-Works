export type CompanySlug = string;

export type CompanyDTO = {
  slug: CompanySlug;
  name: string;
  website?: string | null;
  domain?: string | null;
  logoUrl?: string | null;
  locations: string[];
  jobsCount: number;
  people: {
    id: string;
    name: string;
    email?: string;
    url?: string | null;
  }[];
};

export function normalizeCompanyName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

export function domainFromUrl(url?: string | null): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    return host || null;
  } catch {
    return null;
  }
}

export function slugifyCompany(name: string, fallback?: string | null): CompanySlug {
  const base = (fallback || name).toLowerCase();
  return base
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

export function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}
