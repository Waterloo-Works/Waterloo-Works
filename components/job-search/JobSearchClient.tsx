"use client";

import posthog from 'posthog-js';
import React, { useEffect, useMemo, useState, useCallback, useDeferredValue } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
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
import EmptyState from "@/components/EmptyState";
import { VoiceNotePlayer } from "@/components/VoiceNotePlayer";
import { JobSearchOnboardingTour } from "@/components/JobSearchOnboardingTour";
import { useSession } from "@/providers/SessionProvider";
import Markdown from "react-markdown";
import { BatchApplyButton } from "@/components/job-search/BatchApplyButton";
import { JobCheckbox } from "@/components/job-search/JobCheckbox";
import { BatchApplyModal } from "@/components/job-search/BatchApplyModal";
import { checkApplicationStatus } from "@/app/actions/applications";
import { ApplicationStatus } from "@prisma/client";
import { GROUPED_JOB_TAGS } from "@/lib/constants/job-tags";

type Job = Awaited<ReturnType<typeof import("@/app/actions/jobs").getJobs>>[number];

type Props = {
  jobs: Job[];
  initialSearchParams: Record<string, string | string[] | undefined>;
};

export default function JobSearchClient({ jobs }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const { user, loading } = useSession();

  // Mobile drawer for job details (breakpoint detected on client)
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 767px)").matches
      : true
  );
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 767px)");
    const onChange = () => setIsMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // Job search onboarding tour logic
  const [mounted, setMounted] = useState(false);
  const [showJobSearchTour, setShowJobSearchTour] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !user || loading) return;

    // Check for force flag
    const forceOnboarding = sp?.get('onboarding') === 'forced';
    const tourKey = `job-search-tour-dismissed-${user.id}`;
    const hasSeenTour = localStorage.getItem(tourKey);

    // Debug logging (can be removed later)
    if (process.env.NODE_ENV === 'development') {
      console.log('[JobSearch Onboarding]', {
        forceOnboarding,
        hasSeenTour,
        tourKey,
        userId: user.id,
      });
    }

    if (forceOnboarding) {
      // Show immediately when forced, regardless of localStorage
      setShowJobSearchTour(true);
      return;
    }

    if (!hasSeenTour) {
      // Show tour after a short delay for better UX
      const timer = setTimeout(() => {
        setShowJobSearchTour(true);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [mounted, user, loading, sp]);

  const selectedParam = sp.get("selected") || undefined;
  // Local filter state for snappy client-side updates
  const [tab, setTabState] = useState((sp.get("tab") || "search").toLowerCase());
  const [q, setQ] = useState(sp.get("q") || "");
  const dq = useDeferredValue(q);
  const [typeCsv, setTypeCsv] = useState(sp.get("type") || "");
  const [locCsv, setLocCsv] = useState(sp.get("loc") || "");
  const [remote, setRemote] = useState(sp.get("remote") === "true");
  const [tagsCsv, setTagsCsv] = useState(sp.get("tags") || "");

  const selectedTypes = useMemo(
    () => new Set(typeCsv.split(",").filter(Boolean)),
    [typeCsv]
  );
  const selectedLocs = useMemo(
    () => new Set(locCsv.split(",").filter(Boolean)),
    [locCsv]
  );
  const selectedTags = useMemo(
    () => new Set(tagsCsv.split(",").filter(Boolean)),
    [tagsCsv]
  );

  // Server-backed bookmarked IDs
  const { data: bmData } = useBookmarkedIds();
  const bookmarkedIds = useMemo(() => new Set(bmData?.ids ?? []), [bmData]);

  // Batch apply mode state
  const [batchMode, setBatchMode] = useState(false);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const [applicationStatuses, setApplicationStatuses] = useState<Map<string, ApplicationStatus | null>>(new Map());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [userProfile, setUserProfile] = useState<{ resumeFileName: string | null; resumeUploadedAt: Date | null }>({
    resumeFileName: null,
    resumeUploadedAt: null,
  });

  // Fetch user profile for resume info when entering batch mode
  useEffect(() => {
    if (!user || !batchMode) return;

    fetch('/api/profile')
      .then(res => res.json())
      .then(profile => {
        if (profile && !profile.error) {
          setUserProfile({
            resumeFileName: profile.resumeFileName,
            resumeUploadedAt: profile.resumeUploadedAt ? new Date(profile.resumeUploadedAt) : null,
          });
        }
      })
      .catch(console.error);
  }, [user, batchMode]);

  const quietlySyncQuery = useCallback((next: Record<string, string | undefined>) => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    Object.entries(next).forEach(([k, v]) => {
      if (v === undefined || v === "") url.searchParams.delete(k);
      else url.searchParams.set(k, v);
    });
    window.history.replaceState(window.history.state, "", url.toString());
  }, []);

  // Batch mode handlers
  const toggleBatchMode = useCallback(() => {
    const nextMode = !batchMode;
    setBatchMode(nextMode);

    // If exiting batch mode, reset selections and open modal if jobs selected
    if (!nextMode) {
      if (selectedJobIds.size > 0) {
        setShowBatchModal(true);
      } else {
        setSelectedJobIds(new Set());
      }
    } else {
      // Entering batch mode - clear any previous selections
      setSelectedJobIds(new Set());
    }
  }, [batchMode, selectedJobIds]);

  const handleJobSelect = useCallback((jobId: string, checked: boolean) => {
    setSelectedJobIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(jobId);
      else next.delete(jobId);
      return next;
    });
  }, []);

  const handleBatchApplySuccess = useCallback(() => {
    // Reset batch mode and selections
    setBatchMode(false);
    setSelectedJobIds(new Set());
    setShowBatchModal(false);
    // Refresh will happen via the useEffect below
  }, []);

  const filterJobs = useCallback(
    (items: Job[]) => {
      let out = items;
      // Employment type (AND with other groups)
      if (selectedTypes.size) {
        out = out.filter((j) => selectedTypes.has(j.employmentType));
      }

      // Location group behaves as a union (OR): any selected city OR Remote
      const locTokens = new Set<string>(selectedLocs);
      if (remote) locTokens.add("remote");
      if (locTokens.size) {
        out = out.filter((j) => {
          const loc = (j.location || "").toLowerCase();
          for (const token of locTokens) {
            if (token === "remote") {
              if (/(remote|wfh|work from home|distributed|anywhere)/.test(loc)) return true;
            } else if (loc.includes(token.toLowerCase())) {
              return true;
            }
          }
          return false;
        });
      }

      // Tags filter (OR): job must have at least one of the selected tags
      if (selectedTags.size) {
        out = out.filter((j) => {
          const jobTags = j.tags || [];
          return Array.from(selectedTags).some((tag) => jobTags.includes(tag));
        });
      }

      return out;
    },
    [selectedTypes, selectedLocs, remote, selectedTags]
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
  const [selectedId, setSelectedId] = useState<string | undefined>(undefined);
  useEffect(() => {
    // Respect URL-selected job only on desktop (avoid auto-opening drawer on mobile)
    if (!isMobile && selectedParam && selectedParam !== selectedId) {
      setSelectedId(selectedParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParam, isMobile]);

  // Ensure selection is valid against current results (do not auto-select on mobile)
  useEffect(() => {
    if (!results.length) return setSelectedId(undefined);
    if (selectedId && !results.some((j) => j.id === selectedId)) {
      setSelectedId(undefined);
      quietlySyncSelected(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [results]);

  // Fetch application statuses when results or batch mode changes
  useEffect(() => {
    if (!user || !batchMode) return;

    const jobIds = results.map((j) => j.id);
    if (jobIds.length === 0) return;

    checkApplicationStatus(jobIds).then((statusMap) => {
      setApplicationStatuses(statusMap);
    });
  }, [results, user, batchMode]);

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
    const job = results.find((j) => j.id === id);
    if (job) {
      posthog.capture('job_search_result_selected', {
        job_id: job.id,
        job_position: job.position,
        job_company: job.company,
      });
    }
  };


  const drawerRef = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (isMobile && selectedJob && drawerRef.current) {
      // Reset scroll to top when opening a job in the drawer
      drawerRef.current.scrollTop = 0;
    }
  }, [isMobile, selectedJob]);

  return (
    <>
      <div className="flex h-[calc(100svh-0px)] flex-col" suppressHydrationWarning>
        <Header
          tab={tab}
          q={q}
          selectedTypes={selectedTypes}
          selectedLocs={selectedLocs}
          selectedTags={selectedTags}
          remote={remote}
          savedCount={bookmarkedIds.size}
          batchMode={batchMode}
          selectedCount={selectedJobIds.size}
          onBatchToggle={toggleBatchMode}
          onChange={(next) => {
            if (typeof next.tab !== "undefined") setTabState(next.tab);
            if (Object.prototype.hasOwnProperty.call(next, "q")) setQ(next.q || "");
            if (Object.prototype.hasOwnProperty.call(next, "type")) setTypeCsv(next.type || "");
            if (Object.prototype.hasOwnProperty.call(next, "loc")) setLocCsv(next.loc || "");
            if (Object.prototype.hasOwnProperty.call(next, "tags")) setTagsCsv(next.tags || "");
            if (Object.prototype.hasOwnProperty.call(next, "remote")) setRemote(next.remote === "true");
            quietlySyncQuery(next);
            // Ensure filters/search interactions do not open or keep the drawer open on mobile
            if (isMobile) {
              setSelectedId(undefined);
              quietlySyncSelected(undefined);
            }
          }}
        />
        {/* Mobile: list only (default SSR) */}
        {(mounted ? isMobile : true) && (
          <div className="flex min-h-0 flex-1 md:hidden">
            <div className="flex h-full w-full shrink-0 flex-col border-r border-border bg-background">
              <ResultsList
                jobs={results}
                bookmarkedIds={bookmarkedIds}
                selectedId={selectedJob?.id}
                onSelect={onSelect}
                batchMode={batchMode}
                selectedJobIds={selectedJobIds}
                applicationStatuses={applicationStatuses}
                onJobSelect={handleJobSelect}
              />
            </div>
          </div>
        )}
        {/* Desktop: resizable split (client-only) */}
        {mounted && !isMobile && (
        <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1 bg-background">
          <ResizablePanel defaultSize={34} minSize={22} maxSize={50} className="min-w-[220px] border-r border-border">
            <div className="flex h-full flex-col">
              <ResultsList
                jobs={results}
                bookmarkedIds={bookmarkedIds}
                selectedId={selectedJob?.id}
                onSelect={onSelect}
                batchMode={batchMode}
                selectedJobIds={selectedJobIds}
                applicationStatuses={applicationStatuses}
                onJobSelect={handleJobSelect}
              />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={66} minSize={40} className="min-w-0">
            <div className="h-full overflow-y-auto">
              {selectedJob ? (
                <JobDetail job={selectedJob} initialSaved={bookmarkedIds.has(selectedJob.id)} />
              ) : results.length === 0 ? (
                <EmptyState
                  title="No jobs found"
                  message="Try adjusting your filters or search terms to see more results."
                  showFeedback={true}
                />
              ) : (
                <div className="m-auto p-8 text-center text-muted-foreground">Select a job to view details</div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      )}

      {/* Mobile Drawer: opens when a job is selected */}
      <Drawer
        open={isMobile && !!selectedJob}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(undefined);
            quietlySyncSelected(undefined);
          }
        }}
      >
        <DrawerContent>
          {selectedJob && (
            <div ref={drawerRef} className="w-full -mb-2 pb-2">
              <DrawerHeader className="flex items-center justify-between">
                <DrawerTitle className="font-header text-lg text-foreground truncate pr-4">
                  {selectedJob.position}
                </DrawerTitle>
                <DrawerClose asChild>
                  <button type="button" className="rounded-full border border-input bg-background px-3 py-1.5 text-sm text-foreground hover:bg-muted">Close</button>
                </DrawerClose>
              </DrawerHeader>
              <div className="overflow-y-auto flex-1">
                <JobDetail job={selectedJob} initialSaved={bookmarkedIds.has(selectedJob.id)} />
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
      </div>

      {/* Job Search Onboarding Tour */}
      {showJobSearchTour && (
        <JobSearchOnboardingTour
          onCompleted={() => {
            // Hide the tour immediately
            setShowJobSearchTour(false);

            // Remove onboarding parameter from URL if present
            const newSearchParams = new URLSearchParams(sp?.toString());
            newSearchParams.delete('onboarding');
            const newUrl = newSearchParams.toString()
              ? `${pathname}?${newSearchParams.toString()}`
              : pathname;
            router.replace(newUrl || pathname || '/job-search');
          }}
        />
      )}

      {/* Batch Apply Modal */}
      <BatchApplyModal
        isOpen={showBatchModal}
        onClose={() => {
          setShowBatchModal(false);
          setSelectedJobIds(new Set());
        }}
        selectedJobs={results.filter((j) => selectedJobIds.has(j.id))}
        resumeFileName={userProfile.resumeFileName}
        resumeUploadedAt={userProfile.resumeUploadedAt}
        onSuccess={handleBatchApplySuccess}
      />
    </>
  );
}

function Header({
  tab,
  q,
  selectedTypes,
  selectedLocs,
  selectedTags,
  remote,
  savedCount,
  batchMode,
  selectedCount,
  onBatchToggle,
  onChange,
}: {
  tab: "search" | "saved" | string;
  q: string;
  selectedTypes: Set<string>;
  selectedLocs: Set<string>;
  selectedTags: Set<string>;
  remote: boolean;
  savedCount: number;
  batchMode: boolean;
  selectedCount: number;
  onBatchToggle: () => void;
  onChange: (next: Partial<{ tab: "search" | "saved"; q: string; type: string; loc: string; tags: string; remote: string }>) => void;
}) {
  const setTab = (t: "search" | "saved") => onChange({ tab: t });

  const toggleCsv = (key: string, value: string) => {
    const current = key === "type" ? selectedTypes : key === "loc" ? selectedLocs : selectedTags;
    const list = new Set(current);
    if (list.has(value)) list.delete(value);
    else list.add(value);
    onChange({ [key]: Array.from(list).join(",") });
  };

  return (
    <div className="border-b border-border p-3">
      {/* Desktop title + tabs */}
      <div className="mb-3 hidden items-end justify-between md:flex">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Jobs</h1>
        <nav className="flex items-center gap-6">
          <button
            onClick={() => setTab("search")}
            className={
              "pb-1 text-sm font-medium tracking-wide " +
              (tab === "search" ? "border-b-2 border-foreground" : "border-b-2 border-transparent hover:border-muted-foreground")
            }
          >
            Search
          </button>

        </nav>
      </div>



      {/* Single-row toolbar (desktop). Will wrap on small screens. */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input first; grows to fill row */}
        <div className="relative min-w-[220px] flex-1 md:flex-none md:w-[520px] lg:w-[560px]" data-tour="search-input">
          <input
            type="text"
            value={q}
            placeholder="Search jobs"
            onChange={(e) => onChange({ q: e.target.value || undefined })}
            className="w-full rounded-xl border border-input bg-background py-2 pl-4 pr-12 text-base md:text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
          />
          {q && (
            <button
              aria-label="Clear search"
              className="absolute right-9 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted"
              onClick={() => onChange({ q: undefined })}
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <Search className="h-4 w-4" />
          </div>
        </div>

        {/* Location dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm hover:bg-muted" data-tour="filters">
              <span>Location</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
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

        {/* Tags dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="inline-flex items-center gap-2 rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm hover:bg-muted">
              <span>Tags{selectedTags.size > 0 && ` (${selectedTags.size})`}</span>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto">
            {GROUPED_JOB_TAGS.map((group) => (
              <div key={group.category}>
                <DropdownMenuLabel>{group.category}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {group.tags.map((tag) => (
                  <DropdownMenuCheckboxItem
                    key={tag}
                    checked={selectedTags.has(tag)}
                    onCheckedChange={() => toggleCsv("tags", tag)}
                  >
                    {tag}
                  </DropdownMenuCheckboxItem>
                ))}
                <DropdownMenuSeparator />
              </div>
            ))}
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

        <div className="ml-auto flex items-center gap-2">
          <BatchApplyButton
            isActive={batchMode}
            selectedCount={selectedCount}
            onToggle={onBatchToggle}
          />
          <button
            onClick={() => {
              posthog.capture('job_search_filters_cleared');
              onChange({ q: undefined, type: "", loc: "", tags: "", remote: "" });
            }}
            className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm hover:bg-muted"
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
          ? "bg-primary text-primary-foreground"
          : "border border-input bg-background text-foreground")
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
  batchMode,
  selectedJobIds,
  applicationStatuses,
  onJobSelect,
}: {
  jobs: Job[];
  bookmarkedIds: Set<string>;
  selectedId?: string;
  onSelect: (id: string) => void;
  batchMode: boolean;
  selectedJobIds: Set<string>;
  applicationStatuses: Map<string, ApplicationStatus | null>;
  onJobSelect: (jobId: string, checked: boolean) => void;
}) {
  return (
    <div className="flex-1 overflow-y-auto">
      {jobs.map((j) => (
        <div
          key={j.id}
          role="button"
          tabIndex={0}
          onClick={() => !batchMode && onSelect(j.id)}
          onKeyDown={(e) => {
            if (!batchMode && (e.key === "Enter" || e.key === " ")) {
              e.preventDefault();
              onSelect(j.id);
            }
          }}
          data-selected={selectedId === j.id}
          className={
            "w-full border-b border-border px-3 py-3 md:py-4 text-left transition-colors outline-none focus-visible:ring-1 focus-visible:ring-ring " +
            (batchMode ? "" : "cursor-pointer ") +
            (selectedId === j.id ? "bg-muted" : batchMode ? "" : "hover:bg-muted")
          }
        >
          <div className="flex items-start gap-3">
            {batchMode && (
              <div onClick={(e) => e.stopPropagation()} className="pt-1">
                <JobCheckbox
                  jobId={j.id}
                  isSelected={selectedJobIds.has(j.id)}
                  applicationStatus={applicationStatuses.get(j.id) || null}
                  onSelect={onJobSelect}
                />
              </div>
            )}
            <FaviconImage src={j.companyImageUrl} company={j.company} className="w-9 h-9 md:w-10 md:h-10" />
            <div className="min-w-0 flex-1">
              <div className="font-body text-[13px] text-muted-foreground">{j.company}</div>
              <div className="font-header text-[17px] md:text-lg font-semibold leading-5 text-foreground">{j.position}</div>
              <div className="font-body text-[13px] md:text-[15px] text-foreground">
                {j.salaryMin && j.salaryMax ? `${j.salaryMin} - ${j.salaryMax} · ` : ""}
                {formatEmploymentType(j.employmentType)}
              </div>

              <div className="font-body text-[12px] text-muted-foreground mt-1">{j.location} · {timeAgo(j.createdAt)}</div>
              {j.tags && j.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {j.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary"
                    >
                      {tag}
                    </span>
                  ))}
                  {j.tags.length > 3 && (
                    <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                      +{j.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
            {!batchMode && (
              <div onClick={(e) => e.stopPropagation()} className="ml-auto" data-tour="bookmark-button">
                <BookmarkButton jobId={j.id} initial={bookmarkedIds.has(j.id)} />
              </div>
            )}
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
            <div className="font-body text-sm text-muted-foreground">{job.company}</div>
            <h1 className="font-header text-2xl font-semibold text-foreground">{job.position}</h1>
            <div className="font-body text-[15px] text-foreground">
              {compText ? `${compText} · ` : ""}
              {formatEmploymentType(job.employmentType)}
            </div>
            {job.tags && job.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {job.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary ring-1 ring-inset ring-primary/20"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <BookmarkButton jobId={job.id} initial={initialSaved} />
          <ShareButton jobId={job.id} jobTitle={job.position} />
        </div>
      </div>

      {job.contactUrl && (
        <div className="mb-6" data-tour="apply-button">
          <a
            href={job.contactUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => {
              posthog.capture('job_apply_clicked', {
                job_id: job.id,
                job_position: job.position,
                job_company: job.company,
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            {job.contact || "Apply Now"}
          </a>
        </div>
      )}

      {job.notes && (
        <div className="mt-6 prose prose-sm max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-ul:text-foreground prose-ol:text-foreground prose-li:text-foreground prose-a:text-primary hover:prose-a:text-primary/80 prose-code:text-foreground prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-muted prose-pre:text-foreground prose-blockquote:text-muted-foreground prose-blockquote:border-l-primary">
          <Markdown>{job.notes}</Markdown>
        </div>
      )}

      {job.voiceNoteUrl && (
        <div className="mt-8">
          <h3 className="font-semibold text-foreground mb-4 text-lg">
            🎙️ Message from the Hiring Team
          </h3>
          <VoiceNotePlayer
            url={job.voiceNoteUrl}
            authorName={job.company}
            context="employer_intro"
            jobId={job.id}
          />
        </div>
      )}

      <div className="mt-8 border-t border-border pt-4 text-sm text-muted-foreground font-body">
        Posted {timeAgo(job.createdAt)}
        {job.poster && (
          <> · by {job.poster.fullName || job.poster.email.split("@")[0]}</>
        )}
      </div>
    </div>
  );
}
