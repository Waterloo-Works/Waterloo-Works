"use server";

import { unfurl } from "unfurl.js";

export async function fetchCompanyMetadata(companyName: string) {
  try {
    // Convert company name to domain (e.g., "shopify" -> "shopify.com")
    const domain = companyName.toLowerCase().trim();
    const url = `https://${domain}.com`;

    // Unfurl the URL to get metadata
    const metadata = await unfurl(url, {
      timeout: 10000,
      follow: 5,
    });

    // Prioritize high-resolution OG images over pixelated favicons
    const logo =
      metadata.open_graph?.images?.[0]?.url ||
      metadata.twitter_card?.images?.[0]?.url ||
      metadata.favicon ||
      `${url}/favicon.ico`;

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

    return {
      success: true,
      data: {
        name: name.trim(),
        logo: logo,
        description: description.trim(),
        url: url,
      },
    };
  } catch (error) {
    console.error('Error fetching company metadata:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch company metadata',
    };
  }
}
