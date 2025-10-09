export function formatEmploymentType(type: string): string {
  const mapping: Record<string, string> = {
    FULL_TIME: "Full-Time",
    PART_TIME: "Part-Time",
    CONTRACT: "Contract",
    INTERNSHIP: "Internship",
    OTHER: "Other",
  };
  return mapping[type] || type;
}
