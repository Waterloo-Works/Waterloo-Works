"use client";

import { useEffect, useMemo, useState, useCallback, useDeferredValue } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Search, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import FaviconImage from "@/components/FaviconImage";
import ShareButton from "@/components/ShareButton";
import { formatEmploymentType } from "@/lib/formatEmploymentType";
import { timeAgo } from "@/lib/timeAgo";
import Fuse, { type IFuseOptions } from "fuse.js";
import { fuseOptions, type SearchDoc } from "@/lib/search/fuseConfig";
import { normalizeJob } from "@/lib/search/normalize";
import BookmarkButton from "@/components/BookmarkButton";
import { useBookmarkedIds } from "@/hooks/useBookmarks";

type Job = Awaited<ReturnType<typeof import("@/app/actions/jobs").getJobs>>[number];

type Props = {
  jobs: Job[];
  initialSearchParams: Record<string, string | string[] | undefined>;
};

export default function JobSearchClient({ jobs }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const selectedParam = sp.get("selected") || undefined;
  // Local filter state for snappy client-side updates
  const [tab, setTabState] = useState((sp.get("tab") || "search").toLowerCase());
  const [q, setQ] = useState(sp.get("q") || "");
  const dq = useDeferredValue(q);
  const [typeCsv, setTypeCsv] = useState(sp.get("type") || "");
  const [locCsv, setLocCsv] = useState(sp.get("loc") || "");
  const [remote, setRemote] = useState(sp.get("remote") === "true");

  const selectedTypes = useMemo(
    () => new Set(typeCsv.split(",").filter(Boolean)),
    [typeCsv]
  );
  const selectedLocs = useMemo(
    () => new Set(locCsv.split(",").filter(Boolean)),
    [locCsv]
  );

  // Server-backed bookmarked IDs
  const { data: bmData } = useBookmarkedIds();
  const bookmarkedIds = useMemo(() => new Set(bmData?.ids ?? []), [bmData]);

  const quietlySyncQuery = useCallback((next: Record<string, string | undefined>) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === "") url.searchParams.delete(k);
      else url.searchParams.set(k, v);
    });
    window.history.replaceState(window.history.state, "", url.toString());
  }, []);

  const filterJobs = useCallback(
    (items: Job[]) => {
      let out = items;
      if (selectedTypes.size) {
        out = out.filter((j) => selectedTypes.has(j.employmentType));
      }
      if (remote) {
        out = out.filter((j) => /remote/i.test(j.location || ""));
      }
      if (selectedLocs.size) {
        out = out.filter((j) => {
          const loc = (j.location || "").toLowerCase();
          for (const key of Array.from(selectedLocs)) {
            if (loc.includes(key.toLowerCase())) return true;
          }
          return false;
        });
      }
      return out;
    },
    [selectedTypes, selectedLocs, remote]
  );

  const base = useMemo(() => (tab === "saved" ? jobs.filter((j) => bookmarkedIds.has(j.id)) : jobs), [tab, jobs, bookmarkedIds]);
  const filtered = useMemo(() => filterJobs(base), [base, filterJobs]);

  // Fuse fuzzy search on top of filtered list
  const results = useMemo(() => {
    const query = dq.trim().toLowerCase();
    if (query.length < 2) return filtered;
    // Normalize objects for Fuse
    type JobDoc = Job & SearchDoc;
    const dataset: JobDoc[] = filtered.map((j) => normalizeJob(j) as JobDoc);
    const fuse = new Fuse<JobDoc>(dataset, fuseOptions as IFuseOptions<JobDoc>);
    const hits = fuse.search(query);
    return hits.map((h) => h.item as Job);
  }, [filtered, dq]);

  // Keep "selected" local for instant switching; sync to URL without RSC refresh.
  const [selectedId, setSelectedId] = useState<string | undefined>(selectedParam);
  useEffect(() => {
    // Initialize from URL param on first render or when user lands on a deep link
    if (selectedParam && selectedParam !== selectedId) {
      setSelectedId(selectedParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParam]);

  // Ensure selection is valid against current results
  useEffect(() => {
    if (!results.length) return setSelectedId(undefined);
    if (!selectedId || !results.some((j) => j.id === selectedId)) {
      setSelectedId(results[0]?.id);
      quietlySyncSelected(results[0]?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  const selectedJob = useMemo(() => results.find((j) => j.id === selectedId), [results, selectedId]);

  const quietlySyncSelected = (id?: string) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!id) url.searchParams.delete("selected");
    else url.searchParams.set("selected", id);
    window.history.replaceState(window.history.state, "", url.toString());
  };

  const onSelect = (id: string) => {
    setSelectedId(id);
    quietlySyncSelected(id);
  };

  return (
    <div className="flex h-[calc(100svh-0px)] flex-col">
      <Header
        tab={tab}
        q={q}
        selectedTypes={selectedTypes}
        selectedLocs={selectedLocs}
        remote={remote}
        savedCount={bookmarkedIds.size}
        onChange={(next) => {
          if (typeof next.tab !== "undefined") setTabState(next.tab);
          if (Object.prototype.hasOwnProperty.call(next, "q")) setQ(next.q || "");
          if (Object.prototype.hasOwnProperty.call(next, "type")) setTypeCsv(next.type || "");
          if (Object.prototype.hasOwnProperty.call(next, "loc")) setLocCsv(next.loc || "");
          if (Object.prototype.hasOwnProperty.call(next, "remote")) setRemote(next.remote === "true");
          quietlySyncQuery(next);
        }}
      />
      <div className="flex min-h-0 flex-1">
        <div className="flex h-full w-[260px] md:w-[280px] lg:w-[300px] shrink-0 flex-col border-r border-zinc-200 bg-white">
          <ResultsList
            jobs={results}
            bookmarkedIds={bookmarkedIds}
            selectedId={selectedJob?.id}
            onSelect={onSelect}
          />
        </div>
        <div className="flex min-w-0 flex-1 bg-white">
          {selectedJob ? (
            <JobDetail job={selectedJob} initialSaved={bookmarkedIds.has(selectedJob.id)} />
          ) : (
            <div className="m-auto p-8 text-center text-zinc-500">No results</div>
          )}
        </div>
      </div>
    </div>
  );
}

function Header({
  tab,
  q,
  selectedTypes,
  selectedLocs,
  remote,
  savedCount,
  onChange,
}: {
  tab: "search" | "saved" | string;
  q: string;
  selectedTypes: Set<string>;
  selectedLocs: Set<string>;
  remote: boolean;
  savedCount: number;
  onChange: (next: Partial<{ tab: "search" | "saved"; q: string; type: string; loc: string; remote: string }>) => void;
}) {
  const setTab = (t: "search" | "saved") => onChange({ tab: t });

  const toggleCsv = (key: string, value: string) => {
    const current = key === "type" ? selectedTypes : selectedLocs;
    const list = new Set(current);
    if (list.has(value)) list.delete(value);
    else list.add(value);
    onChange({ [key]: Array.from(list).join(",") });
  };

  return (
    <div className="border-b border-zinc-200 p-3">
      {/* Desktop title + tabs */}
      <div className="mb-3 hidden items-end justify-between md:flex">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">Jobs</h1>
        <nav className="flex items-center gap-6">
          <button
            onClick={() => setTab("search")}
            className={
              "pb-1 text-sm font-medium tracking-wide " +
              (tab === "search" ? "border-b-2 border-zinc-900" : "border-b-2 border-transparent hover:border-zinc-300")
            }
          >
            Search
          </button>
        
        </nav>
      </div>

      {/* Mobile pills for tabs */}
      <div className="mb-3 flex items-center gap-2 md:hidden">
        <button
          onClick={() => setTab("search")}
          className={
            "rounded-full px-3 py-1.5 text-sm " +
            (tab === "search" ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700")
          }
        >
          Search
        </button>
      
      </div>

      {/* Single-row toolbar (desktop). Will wrap on small screens. */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input first; grows to fill row */}
        <div className="relative min-w-[220px] flex-1 md:flex-none md:w-[520px] lg:w-[560px]">
          <input
            type="text"
            value={q}
            placeholder="Search jobs"
            onChange={(e) => onChange({ q: e.target.value || undefined })}
            className="w-full rounded-xl border border-zinc-200 bg-white py-2 pl-4 pr-12 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
          />
          {q && (
            <button
              aria-label="Clear search"
              className="absolute right-9 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-500 hover:bg-zinc-100"
              onClick={() => onChange({ q: undefined })}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">
            <Search className="h-4 w-4" />
          </div>
        </div>

        {/* Location dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 shadow-sm hover:bg-zinc-50">
              <span>Location</span>
              <ChevronDown className="h-4 w-4 text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Select locations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {locationChips.map((l) => (
              <DropdownMenuCheckboxItem
                key={l.value}
                checked={selectedLocs.has(l.value)}
                onCheckedChange={() => toggleCsv("loc", l.value)}
              >
                {l.label}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={remote}
              onCheckedChange={() => onChange({ remote: (!remote).toString() })}
            >
              Remote
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Commitment pills */}
        {typeChips.map((t) => (
          <Chip
            key={t.value}
            label={t.label}
            active={selectedTypes.has(t.value)}
            onClick={() => toggleCsv("type", t.value)}
          />
        ))}

        <div className="ml-auto">
          <button
            onClick={() => onChange({ q: undefined, type: "", loc: "", remote: "" })}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
}

const typeChips = [
  { value: "FULL_TIME", label: "Full-time job" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
];

const locationChips = [
  { value: "new york", label: "New York" },
  { value: "san francisco", label: "San Francisco" },
  { value: "toronto", label: "Toronto" },
];

function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm " +
        (active
          ? "bg-zinc-900 text-white"
          : "border border-zinc-200 bg-white text-zinc-700")
      }
    >
      {label}
    </button>
  );
}

function ResultsList({
  jobs,
  bookmarkedIds,
  selectedId,
  onSelect,
}: {
  jobs: Job[];
  bookmarkedIds: Set<string>;
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {jobs.map((j) => (
        <div
          key={j.id}
          role="button"
          tabIndex={0}
          onClick={() => onSelect(j.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(j.id);
            }
          }}
          data-selected={selectedId === j.id}
          className={
            "w-full cursor-pointer border-b border-zinc-100 px-3 py-4 text-left transition-colors outline-none focus-visible:ring-1 focus-visible:ring-zinc-300 " +
            (selectedId === j.id ? "bg-zinc-50" : "hover:bg-zinc-50")
          }
        >
          <div className="flex items-start gap-3">
            <FaviconImage src={j.companyImageUrl} company={j.company} />
            <div className="min-w-0 flex-1">
              <div className="font-body text-sm text-zinc-600">{j.company}</div>
              <div className="font-title text-lg font-semibold text-zinc-900">{j.position}</div>
              <div className="font-body text-[15px] text-zinc-700">
                {j.salaryMin && j.salaryMax ? `${j.salaryMin} - ${j.salaryMax} · ` : ""}
                {formatEmploymentType(j.employmentType)}
              </div>
          
              <div className="font-body text-sm text-zinc-500 mt-1">
                {j.location} · {timeAgo(j.createdAt)}
              </div>
            </div>
            <div onClick={(e) => e.stopPropagation()} className="ml-auto">
              <BookmarkButton jobId={j.id} initial={bookmarkedIds.has(j.id)} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function JobDetail({ job, initialSaved }: { job: Job; initialSaved: boolean }) {
  const compText = job.salaryMin && job.salaryMax
    ? `${job.salaryMin} - ${job.salaryMax}`
    : job.salaryMin
    ? `${job.salaryMin}+`
    : job.salaryMax
    ? `Up to ${job.salaryMax}`
    : undefined;

  return (
    <div className="w-full px-6 lg:px-10 py-10">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <FaviconImage src={job.companyImageUrl} company={job.company} />
          <div>
            <div className="font-body text-sm text-zinc-600">{job.company}</div>
            <h1 className="font-title text-2xl font-semibold text-zinc-900">{job.position}</h1>
            <div className="font-body text-[15px] text-zinc-700">
              {compText ? `${compText} · ` : ""}
              {formatEmploymentType(job.employmentType)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookmarkButton jobId={job.id} initial={initialSaved} />
          <ShareButton jobId={job.id} jobTitle={job.position} />
        </div>
      </div>


      {job.notes && (
        <div className="mt-6 space-y-2">
          <p className="font-body whitespace-pre-wrap text-[15px] text-zinc-700">{job.notes}</p>
        </div>
      )}

      <div className="mt-8 border-t border-zinc-200 pt-4 text-sm text-zinc-500 font-body">
        Posted {timeAgo(job.createdAt)}
        {job.poster && (
          <> · by {job.poster.fullName || job.poster.email.split("@")[0]}</>
        )}
      </div>
    </div>
  );
}
