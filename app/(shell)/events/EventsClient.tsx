"use client";

import { useState } from "react";

export default function EventsClient() {
  const [activeRegion, setActiveRegion] = useState<"bay-area" | "waterloo">("bay-area");

  return (
    <main className="mx-auto max-w-6xl px-4 md:px-8 py-8 md:py-14">
      <div className="mb-8">
        <h1 className="font-header text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-3">
          Events
        </h1>
        <p className="font-body text-muted-foreground text-base">
          Community‑hosted events and meetups for Waterloo students and alumni.
        </p>
      </div>

      {/* Region Selector */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-2 p-1 bg-muted rounded-full border border-border">
          <button
            onClick={() => setActiveRegion("bay-area")}
            className={`px-6 py-2 rounded-full font-body text-sm font-medium transition-all ${
              activeRegion === "bay-area"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Bay Area
          </button>
          <button
            onClick={() => setActiveRegion("waterloo")}
            className={`px-6 py-2 rounded-full font-body text-sm font-medium transition-all ${
              activeRegion === "waterloo"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Waterloo
          </button>
        </div>

        {/* Add to Calendar CTA */}
        <a
          href={
            activeRegion === "bay-area"
              ? "https://calendar.google.com/calendar/u/0/r?cid=a848ddc9f2818c740c5a7eb586d76344e08130ec84b32d014b7d9586d58660b3@group.calendar.google.com"
              : "https://calendar.google.com/calendar/u/0?cid=NWU3M2MwZTM1Y2NlZDVjMThhMDU3ZjJhNmExMGYzZTg4MGFlOGY3MGQzZWE4YWQ1N2JiZWFiYzQxYTMyOGVkNUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 font-body text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted hover:shadow-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span>Add to Google Calendar</span>
        </a>
      </div>

      {/* Calendar Embed */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm overflow-auto">
        {activeRegion === "bay-area" ? (
          <iframe
            src="https://calendar.google.com/calendar/embed?src=a848ddc9f2818c740c5a7eb586d76344e08130ec84b32d014b7d9586d58660b3%40group.calendar.google.com&ctz=America%2FLos_Angeles"
            style={{ border: 0 }}
            width={800}
            height={600}
            frameBorder={0}
            scrolling="no"
            className="mx-auto block w-full"
            title="Bay Area Events Calendar"
          />
        ) : (
          <iframe
            src="https://calendar.google.com/calendar/embed?src=5e73c0e35cced5c18a057f2a6a10f3e880ae8f70d3ea8ad57bbeabc41a328ed5%40group.calendar.google.com&ctz=America%2FLos_Angeles"
            style={{ border: 0 }}
            width={800}
            height={600}
            frameBorder={0}
            scrolling="no"
            className="mx-auto block w-full"
            title="Waterloo Events Calendar"
          />
        )}
      </div>

      <p className="mt-4 text-center font-body text-sm text-muted-foreground">
        Subscribe to stay updated on all Waterloo community events in{" "}
        {activeRegion === "bay-area" ? "the Bay Area" : "Waterloo"}.
      </p>

      {/* Event Suggestion Form */}
      <div className="mt-16">
        <div className="mb-6">
          <h2 className="font-header text-2xl font-semibold tracking-tight text-foreground mb-2">
            Suggest an Event
          </h2>
          <p className="font-body text-sm text-muted-foreground max-w-2xl">
            Have an event you&apos;d like to see listed? Submit the details below and we&apos;ll add it to the calendar.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 overflow-hidden">
          <iframe
            src="https://docs.google.com/forms/d/e/1FAIpQLSdyF8mZIwjv3hw-qrewqpnJhR3O3znBI297-UID82BNBhJXYg/viewform?embedded=true"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
            className="w-full h-[750px]"
            title="Suggest an Event Form"
          >
            Loading…
          </iframe>
        </div>
      </div>
    </main>
  );
}
