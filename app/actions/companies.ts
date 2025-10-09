"use server";

import { getJobs } from "@/app/actions/jobs";
import type { CompanyDTO } from "@/lib/company";
import { domainFromUrl, normalizeCompanyName, slugifyCompany, unique } from "@/lib/company";

export async function getCompanies(): Promise<CompanyDTO[]> {
  const jobs = await getJobs();
  const map = new Map<string, CompanyDTO & { _ids: string[] }>();

  for (const j of jobs) {
    const domain = domainFromUrl(j.companyUrl);
    const nameNorm = normalizeCompanyName(j.company);
    const key = domain || nameNorm.toLowerCase();
    const slug = slugifyCompany(nameNorm, domain || nameNorm);

    const entry = map.get(key) || {
      slug,
      name: nameNorm,
      website: j.companyUrl || null,
      domain: domain,
      logoUrl: j.companyImageUrl || null,
      locations: [],
      jobsCount: 0,
      people: [],
      _ids: [],
    };

    entry.jobsCount += 1;
    if (j.location) entry.locations.push(j.location);
    if (j.poster) {
      entry.people.push({ id: `user:${j.poster.id}`, name: j.poster.fullName || j.poster.email.split("@")[0], email: j.poster.email });
    }
    if (j.contact) {
      // Prefer linking a contact URL if present; email if it's a mailto or plain email
      const isEmail = /@/.test(j.contactUrl || "") || /@/.test(j.contact || "");
      const email = isEmail ? (j.contactUrl?.replace(/^mailto:/, "") || (/@/.test(j.contact) ? j.contact : undefined)) : undefined;
      entry.people.push({ id: `contact:${slug}:${j.contact.toLowerCase()}` , name: j.contact, email, url: email ? undefined : (j.contactUrl || null) });
    }
    entry._ids.push(j.id);

    map.set(key, entry);
  }

  const companies = Array.from(map.values()).map((c) => ({
    ...c,
    locations: summarizeLocations(c.locations),
    people: dedupePeople(c.people),
  }));

  // sort by jobsCount desc then name asc
  companies.sort((a, b) => (b.jobsCount - a.jobsCount) || a.name.localeCompare(b.name));
  return companies;
}

export async function getCompany(slug: string) {
  const jobs = await getJobs();
  const companies = await getCompanies();
  const company = companies.find((c) => c.slug === slug);
  if (!company) return { company: null, jobs: [] as Awaited<ReturnType<typeof getJobs>>, people: [] as CompanyDTO["people"] };
  const jobsFor = jobs.filter((j) => {
    const domain = domainFromUrl(j.companyUrl);
    const nameNorm = normalizeCompanyName(j.company);
    const s = slugifyCompany(nameNorm, domain || nameNorm);
    return s === slug;
  });
  const people = dedupePeople([
    ...jobsFor.map((j) => ({ id: `user:${j.poster.id}`, name: j.poster.fullName || j.poster.email.split("@")[0], email: j.poster.email })),
    ...jobsFor
      .filter((j) => !!j.contact)
      .map((j) => {
        const isEmail = /@/.test(j.contactUrl || "") || /@/.test(j.contact || "");
        const email = isEmail ? (j.contactUrl?.replace(/^mailto:/, "") || (/@/.test(j.contact) ? j.contact : undefined)) : undefined;
        return { id: `contact:${slug}:${j.contact.toLowerCase()}`, name: j.contact, email, url: email ? undefined : (j.contactUrl || null) };
      }),
  ]);
  return { company, jobs: jobsFor, people };
}

function summarizeLocations(list: string[]): string[] {
  // Keep distinct city/state entries; compress overly long lists
  const deduped = unique(list.map((s) => s.trim()).filter(Boolean));
  if (deduped.length <= 3) return deduped;
  return deduped.slice(0, 2).concat([`${deduped.length - 2} more`]);
}

function dedupePeople(people: CompanyDTO["people"]): CompanyDTO["people"] {
  const seen = new Map<string, CompanyDTO["people"][number]>();
  for (const p of people) {
    if (!seen.has(p.id)) seen.set(p.id, p);
  }
  return Array.from(seen.values());
}
