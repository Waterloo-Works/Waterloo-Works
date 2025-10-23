"use server";

export async function fetchCompanyMetadata(url: string) {
  try {
    // Validate URL
    const parsedUrl = new URL(url);

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; WaterlooBot/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const html = await response.text();

    // Extract metadata using regex (simple approach)
    const getMetaContent = (property: string) => {
      const ogPattern = new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
      const namePattern = new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i');
      const ogMatch = html.match(ogPattern);
      const nameMatch = html.match(namePattern);
      return ogMatch?.[1] || nameMatch?.[1] || null;
    };

    const getTitleContent = () => {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      return titleMatch?.[1] || null;
    };

    const name = getMetaContent('og:title') ||
                 getMetaContent('og:site_name') ||
                 getTitleContent() ||
                 parsedUrl.hostname.replace('www.', '');

    // Prioritize favicon over large images
    const getFavicon = () => {
      // Look for apple-touch-icon first (usually high quality)
      const appleTouchIcon = html.match(/<link[^>]*rel=["']apple-touch-icon["'][^>]*href=["']([^"']*)["']/i);
      if (appleTouchIcon?.[1]) return appleTouchIcon[1];

      // Look for icon or shortcut icon
      const iconMatch = html.match(/<link[^>]*rel=["'](?:icon|shortcut icon)["'][^>]*href=["']([^"']*)["']/i);
      if (iconMatch?.[1]) return iconMatch[1];

      // Default to favicon.ico
      return '/favicon.ico';
    };

    const favicon = getFavicon();
    const logo = favicon.startsWith('http') ? favicon : `${parsedUrl.origin}${favicon}`;

    const description = getMetaContent('og:description') ||
                        getMetaContent('description') ||
                        '';

    return {
      success: true,
      data: {
        name: name.trim(),
        logo: logo,
        description: description.trim(),
        url: parsedUrl.origin,
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
