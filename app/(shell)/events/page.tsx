import { Suspense } from "react";

export const metadata = { title: "Events" };

export default function EventsPage() {
  return (
    <div className="mx-auto max-w-6xl px-8 py-14">
      <h1 className="mb-10 text-3xl font-semibold tracking-tight text-zinc-900">Events</h1>
      <Suspense fallback={<EventsSkeleton />}> 
        <EventsContent />
      </Suspense>
    </div>
  );
}

async function EventsContent() {
  // Placeholder: no events source yet
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 text-center text-zinc-600 shadow-sm">
      No events right now. Check back later.
    </div>
  );
}

function EventsSkeleton() {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="h-5 w-40 bg-zinc-200 rounded" />
      <div className="mt-3 h-4 w-1/2 bg-zinc-200 rounded" />
    </div>
  );
}

