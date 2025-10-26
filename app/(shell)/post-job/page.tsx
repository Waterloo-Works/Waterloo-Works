import PostJobForm from "./PostJobForm";
import { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://waterloo.works';

export const metadata: Metadata = {
  title: "Post a Job | Waterloo.app - Hire Top Canadian Students",
  description: "Reach cracked Canadian students from UWaterloo. Post your internship, co-op, or full-time position on waterloo.app and connect with ambitious tech talent ready to match your company's goals.",
  openGraph: {
    title: "Post a Job on Waterloo.app",
    description: "Reach cracked Canadian students from UWaterloo. Free to post, quality matches, fast and easy.",
    url: `${siteUrl}/post-job`,
    siteName: 'waterloo.app',
    images: [
      {
        url: `${siteUrl}/api/og/post-job`,
        width: 1200,
        height: 630,
        alt: 'Post a job on waterloo.app - Hire top Canadian students',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Post a Job on Waterloo.app",
    description: "Reach cracked Canadian students from UWaterloo. Free to post, quality matches, fast and easy.",
    images: [`${siteUrl}/api/og/post-job`],
  },
};

export default async function PostJobPage() {
    return <PostJobForm />;
}
