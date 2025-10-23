"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  src: string;
  alt: string;
  companyName: string;
};

export default function CompanyLogo({ src, alt, companyName }: Props) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (hasError) return; // Prevent infinite loop

    console.log(`[CompanyLogo] Failed to load image: ${imgSrc}`);
    setHasError(true);

    // Extract domain from company name for Google's favicon service
    const input = companyName.toLowerCase().trim();
    const commonTLDs = ['.com', '.co', '.io', '.ai', '.org', '.net', '.dev', '.app', '.xyz', '.tech', '.shop', '.store', '.me', '.cc', '.tv'];
    const hasTLD = commonTLDs.some(tld => input.endsWith(tld));
    const domain = hasTLD ? input : `${input}.com`;
    const fallbackUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    console.log(`[CompanyLogo] Using fallback: ${fallbackUrl}`);
    setImgSrc(fallbackUrl);
  };

  return (
    <div className="relative max-h-20 md:max-h-24">
      <Image
        src={imgSrc}
        alt={alt}
        width={200}
        height={96}
        className="object-contain max-h-20 md:max-h-24 w-auto rounded-lg shadow-2xl"
        unoptimized
        onError={handleError}
      />
    </div>
  );
}
