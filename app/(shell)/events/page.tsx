import { Metadata } from "next";
import EventsClient from "./EventsClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waterloo.works';

export const metadata: Metadata = {
  title: "Events | Waterloo.app - Community Meetups & Networking",
  description: "Join Waterloo students and alumni at community events and meetups. Connect with fellow students in the Bay Area and Waterloo region.",
  openGraph: {
    title: "Waterloo Community Events",
    description: "Connect with Waterloo students and alumni at meetups and networking events in the Bay Area and Waterloo.",
    url: `${siteUrl}/events`,
    siteName: 'waterloo.app',
    images: [
      {
        url: `${siteUrl}/api/og/events`,
        width: 1200,
        height: 630,
        alt: 'Waterloo community events calendar',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Waterloo Community Events",
    description: "Connect with Waterloo students and alumni at meetups and networking events.",
    images: [`${siteUrl}/api/og/events`],
  },
};

export default function EventsPage() {
  return <EventsClient />;
}
