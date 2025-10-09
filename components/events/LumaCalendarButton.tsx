"use client";

import Script from "next/script";

type Props = {
  calendarId: string
  label?: string
}

export default function LumaCalendarButton({ calendarId, label = "View Events" }: Props) {
  return (
    <>
      <Script src="https://embed.lu.ma/calendar-button.js" strategy="afterInteractive" />
      <button
        className="luma-embed--button rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-700 shadow-sm hover:bg-zinc-50"
        data-luma-action="calendar"
        data-luma-calendar-id={calendarId}
        type="button"
      >
        {label}
      </button>
    </>
  );
}

