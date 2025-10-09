"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import FaviconImage from "@/components/FaviconImage";
import ShareButton from "@/components/ShareButton";
import { formatEmploymentType } from "@/lib/formatEmploymentType";
import { timeAgo } from "@/lib/timeAgo";

type Job = Awaited<ReturnType<typeof import("@/app/actions/jobs").getJobs>>[number];

type Props = {
  jobs: Job[];
  initialSearchParams: Record<string, string | string[] | undefined>;
};

export default function JobSearchClient({ jobs }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const tab = (sp.get("tab") || "search").toLowerCase();
  const selectedParam = sp.get("selected") || undefined;
  const q = sp.get("q") || "";
  const typeCsv = sp.get("type") || "";
  const locCsv = sp.get("loc") || "";
  const remote = sp.get("remote") === "true";

  const selectedTypes = useMemo(
    () => new Set(typeCsv.split(",").filter(Boolean)),
    [typeCsv]
  );
  const selectedLocs = useMemo(
    () => new Set(locCsv.split(",").filter(Boolean)),
    [locCsv]
  );

  // Saved jobs in localStorage (MVP). Can be replaced with DB later.
  const [saved, setSaved] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = localStorage.getItem("savedJobs");
    if (raw) setSaved(new Set(JSON.parse(raw)));
  }, []);
  const persistSaved = (next: Set<string>) => {
    setSaved(new Set(next));
    if (typeof window !== "undefined") {
      localStorage.setItem("savedJobs", JSON.stringify(Array.from(next)));
    }
  };
  const toggleSave = (id: string) => {
    const next = new Set(saved);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    persistSaved(next);
  };

  const setParam = useCallback(
    (next: Record<string, string | undefined>) => {
      const params = new URLSearchParams(sp.toString());
      Object.entries(next).forEach(([k, v]) => {
        if (v === undefined || v === "") params.delete(k);
        else params.set(k, v);
      });
      router.replace(`${pathname}?${params.toString()}`);
    },
    [router, pathname, sp]
  );

  const filterJobs = useCallback(
    (items: Job[]) => {
      let out = items;
      if (q) {
        const s = q.toLowerCase();
        out = out.filter(
          (j) =>
            j.position.toLowerCase().includes(s) ||
            j.company.toLowerCase().includes(s) ||
            (j.location || "").toLowerCase().includes(s)
        );
      }
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
    [q, selectedTypes, selectedLocs, remote]
  );

  const base = useMemo(() => (tab === "saved" ? jobs.filter((j) => saved.has(j.id)) : jobs), [tab, jobs, saved]);
  const results = useMemo(() => filterJobs(base), [base, filterJobs]);

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
    <div className="flex h-[calc(100svh-0px)]">
      <div className="flex h-full w-[280px] md:w-[300px] lg:w-[300px] shrink-0 flex-col border-r border-zinc-200 bg-white">
        <Header
          tab={tab}
          q={q}
          selectedTypes={selectedTypes}
          selectedLocs={selectedLocs}
          remote={remote}
          onChange={(next) => setParam(next)}
        />
        <ResultsList
          jobs={results}
          saved={saved}
          selectedId={selectedJob?.id}
          onSelect={onSelect}
          onToggleSave={toggleSave}
        />
      </div>
      <div className="flex min-w-0 flex-1 bg-white">
        {selectedJob ? (
          <JobDetail job={selectedJob} saved={saved.has(selectedJob.id)} onToggleSave={() => toggleSave(selectedJob.id)} />
        ) : (
          <div className="m-auto p-8 text-center text-zinc-500">No results</div>
        )}
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
  onChange,
}: {
  tab: string;
  q: string;
  selectedTypes: Set<string>;
  selectedLocs: Set<string>;
  remote: boolean;
  onChange: (next: Record<string, string | undefined>) => void;
}) {
  const sp = useSearchParams();
  const params = new URLSearchParams(sp.toString());

  const setTab = (t: "search" | "saved") => onChange({ tab: t });

  const toggleCsv = (key: string, value: string) => {
    const list = new Set((params.get(key) || "").split(",").filter(Boolean));
    if (list.has(value)) list.delete(value);
    else list.add(value);
    onChange({ [key]: Array.from(list).join(",") });
  };

  return (
    <div className="border-b border-zinc-200 p-3">
      <div className="mb-3 flex items-center gap-2">
        <button
          onClick={() => setTab("search")}
          className={
            "rounded-full px-3 py-1.5 text-sm " +
            (tab === "search" ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700")
          }
        >
          Search
        </button>
        <button
          onClick={() => setTab("saved")}
          className={
            "rounded-full px-3 py-1.5 text-sm " +
            (tab === "saved" ? "bg-zinc-900 text-white" : "border border-zinc-200 bg-white text-zinc-700")
          }
        >
          Saved
        </button>
      </div>
      <div className="mb-2">
        <input
          type="text"
          defaultValue={q}
          placeholder="Search jobs"
          onChange={(e) => onChange({ q: e.target.value || undefined })}
          className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-300"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        {typeChips.map((t) => (
          <Chip
            key={t.value}
            label={t.label}
            active={selectedTypes.has(t.value)}
            onClick={() => toggleCsv("type", t.value)}
          />
        ))}
        {locationChips.map((l) => (
          <Chip
            key={l.value}
            label={l.label}
            active={selectedLocs.has(l.value)}
            onClick={() => toggleCsv("loc", l.value)}
          />
        ))}
        <Chip
          label="Remote"
          active={remote}
          onClick={() => onChange({ remote: (!remote).toString() })}
        />
        <button className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700">
          Filters
        </button>
      </div>
    </div>
  );
}

const typeChips = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "OTHER", label: "Other" },
];

const locationChips = [
  { value: "new york", label: "New York" },
  { value: "san francisco", label: "San Francisco" },
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
  saved,
  selectedId,
  onSelect,
  onToggleSave,
}: {
  jobs: Job[];
  saved: Set<string>;
  selectedId?: string;
  onSelect: (id: string) => void;
  onToggleSave: (id: string) => void;
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
          aria-selected={selectedId === j.id}
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
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleSave(j.id);
              }}
              className={
                "ml-auto rounded-full border px-2 py-1 text-xs " +
                (saved.has(j.id) ? "border-zinc-900 text-zinc-900" : "border-zinc-300 text-zinc-600")
              }
            >
              {saved.has(j.id) ? "Saved" : "Save"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function JobDetail({ job, saved, onToggleSave }: { job: Job; saved: boolean; onToggleSave: () => void }) {
  const compText = job.salaryMin && job.salaryMax
    ? `${job.salaryMin} - ${job.salaryMax}`
    : job.salaryMin
    ? `${job.salaryMin}+`
    : job.salaryMax
    ? `Up to ${job.salaryMax}`
    : undefined;

  return (
    <div className="mx-auto w-full max-w-5xl px-6 lg:px-10 py-10">
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
          <button
            onClick={onToggleSave}
            className={
              "rounded-full border px-3 py-1.5 text-sm " +
              (saved ? "border-zinc-900 text-zinc-900" : "border-zinc-300 text-zinc-700")
            }
          >
            {saved ? "Saved" : "Save"}
          </button>
          <ShareButton jobId={job.id} jobTitle={job.position} />
        </div>
      </div>

      <div className="space-y-2 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="font-title text-lg font-semibold text-zinc-900">At a glance</h2>
        <ul className="font-body text-[15px] text-zinc-700 space-y-1">
          {compText && <li>{compText}</li>}
          <li>{job.location}</li>
          <li>{formatEmploymentType(job.employmentType)}</li>
        </ul>
      </div>

      {job.notes && (
        <div className="mt-6 space-y-2">
          <h3 className="font-title text-lg font-semibold text-zinc-900">Notes</h3>
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
