import { EXPERIENCE } from "@/src/data/portfolioData";
import type { TimelineEntry } from "./types";

/** Flattens companies → roles, newest first, so every role gets its own timeline node. */
export const TIMELINE_ENTRIES: TimelineEntry[] = EXPERIENCE.flatMap((company) =>
  company.roles.map((role, i) => ({
    ...role,
    company: company.company,
    location: company.location,
    companySummary: i === 0 ? company.companySummary : undefined,
  })),
);
