"use server";

import { unfurl } from "unfurl.js";

export async function fetchCompanyMetadata(companyName: string) {
  const input = companyName.toLowerCase().trim();

  // Common TLDs to check for
  const commonTLDs = ['.com', '.co', '.io', '.ai', '.org', '.net', '.dev', '.app', '.xyz', '.tech', '.shop', '.store', '.me', '.cc', '.tv'];

  // Check if the input already has a TLD
  const hasTLD = commonTLDs.some(tld => input.endsWith(tld));

  // If it has a TLD, use as-is; otherwise append .com
  const domain = hasTLD ? input : `${input}.com`;
  const url = `https://${domain}`;

  try {
    console.log(`[Metadata] Fetching metadata for ${url}...`);

    // Unfurl the URL to get metadata (follows redirects automatically)
    const metadata = await unfurl(url, {
      timeout: 15000, // Increased timeout to 15 seconds
      follow: 5, // Follow up to 5 redirects (e.g., slash.app -> slash.com)
    });

    // Use canonical URL if available (handles redirects properly)
    const resolvedUrl = metadata.canonical_url || metadata.open_graph?.url || url;

    // Prioritize high-resolution OG images over pixelated favicons
    const logo =
      metadata.open_graph?.images?.[0]?.url ||
      metadata.twitter_card?.images?.[0]?.url ||
      metadata.favicon ||
      `https://www.google.com/s2/favicons?domain=${domain}&sz=128`; // Google's favicon service as ultimate fallback

    // Extract the best available name
    const name =
      metadata.open_graph?.site_name ||
      metadata.open_graph?.title ||
      metadata.title ||
      companyName.charAt(0).toUpperCase() + companyName.slice(1);

    // Extract description
    const description =
      metadata.open_graph?.description ||
      metadata.description ||
      '';

    console.log(`[Metadata] Successfully fetched metadata for ${url}`, {
      name,
      logo,
      resolvedUrl,
      hasDescription: !!description,
    });

    return {
      success: true,
      data: {
        name: name.trim(),
        logo: logo,
        description: description.trim(),
        url: resolvedUrl, // Use resolved/canonical URL
      },
    };
  } catch (error) {
    console.error(`[Metadata] Error fetching metadata for ${url}:`, error);

    // Return fallback data even on error
    return {
      success: true, // Changed to true so we still render something
      data: {
        name: companyName.charAt(0).toUpperCase() + companyName.slice(1),
        logo: `https://www.google.com/s2/favicons?domain=${domain}&sz=128`, // Google's favicon service
        description: '',
        url: url,
      },
    };
  }
}
