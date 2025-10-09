type Props = {
  calendarId: string
  height?: number
}

export default function LumaCalendarEmbed({ calendarId, height = 800 }: Props) {
  const src = `https://lu.ma/${encodeURIComponent(calendarId)}/embed`
  return (
    <iframe
      src={src}
      title="Events calendar"
      loading="lazy"
      referrerPolicy="strict-origin-when-cross-origin"
      width="100%"
      height={height}
      className="w-full rounded-2xl ring-1 ring-zinc-200 bg-white"
      style={{ border: 0 }}
    />
  )
}

