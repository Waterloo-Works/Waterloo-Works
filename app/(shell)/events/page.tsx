export const metadata = { title: "Events" };

export default async function EventsPage() {
  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-header text-3xl md:text-4xl font-semibold tracking-tight text-zinc-900 mb-2">Events</h1>
        <p className="font-body text-zinc-700">Community‑hosted events and meetups.</p>
      </div>

      {/* Prominent Add to Calendar CTAs */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 justify-center items-center">
        <a
          href="https://calendar.google.com/calendar/u/0/r?cid=a848ddc9f2818c740c5a7eb586d76344e08130ec84b32d014b7d9586d58660b3@group.calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-4 font-header text-lg font-semibold text-white shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 hover:shadow-xl hover:scale-105 w-full md:w-auto justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Add Bay Area Calendar</span>
        </a>

        <a
          href="https://calendar.google.com/calendar/u/0?cid=NWU3M2MwZTM1Y2NlZDVjMThhMDU3ZjJhNmExMGYzZTg4MGFlOGY3MGQzZWE4YWQ1N2JiZWFiYzQxYTMyOGVkNUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-700 px-8 py-4 font-header text-lg font-semibold text-white shadow-lg hover:from-purple-700 hover:to-purple-800 transition-all duration-200 hover:shadow-xl hover:scale-105 w-full md:w-auto justify-center"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Add Waterloo Calendar</span>
        </a>
      </div>

      {/* Bay Area Calendar */}
      <div className="mb-8">
        <h2 className="font-header text-2xl font-semibold text-zinc-900 mb-4">Bay Area Events</h2>
        <div className="overflow-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <iframe
            src="https://calendar.google.com/calendar/embed?src=a848ddc9f2818c740c5a7eb586d76344e08130ec84b32d014b7d9586d58660b3%40group.calendar.google.com&ctz=America%2FLos_Angeles"
            style={{ border: 0 }}
            width={800}
            height={600}
            frameBorder={0}
            scrolling="no"
            className="mx-auto block"
          />
        </div>
      </div>

      {/* Waterloo Calendar */}
      <div className="mb-8">
        <h2 className="font-header text-2xl font-semibold text-zinc-900 mb-4">Waterloo Events</h2>
        <div className="overflow-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
          <iframe
            src="https://calendar.google.com/calendar/embed?src=5e73c0e35cced5c18a057f2a6a10f3e880ae8f70d3ea8ad57bbeabc41a328ed5%40group.calendar.google.com&ctz=America%2FLos_Angeles"
            style={{ border: 0 }}
            width={800}
            height={600}
            frameBorder={0}
            scrolling="no"
            className="mx-auto block"
          />
        </div>
      </div>
    </main>
  );
}
