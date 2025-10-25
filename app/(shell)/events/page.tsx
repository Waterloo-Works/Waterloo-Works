export const metadata = { title: "Events" };

export default async function EventsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="font-header text-3xl md:text-4xl font-semibold tracking-tight text-foreground mb-2">Events</h1>
        <p className="font-body text-zinc-700">Community‑hosted events and meetups.</p>
      </div>

      {/* Hard-coded Google Calendar embed */}
      <div className="overflow-auto rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <iframe
          src="https://calendar.google.com/calendar/embed?src=mr1vn19vbj3er0p7esp4gt9n7b250htj%40import.calendar.google.com&ctz=America%2FLos_Angeles"
          style={{ border: 0 }}
          width={800}
          height={600}
          frameBorder={0}
          scrolling="no"
          className="mx-auto block"
        />
      </div>
    </main>
  );
}
