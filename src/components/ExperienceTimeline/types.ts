import { EXPERIENCE } from "../../data/portfolioData";

export type Role = (typeof EXPERIENCE)[number]["roles"][number];
export type Company = (typeof EXPERIENCE)[number];

/** One timeline entry: a role plus the company it belongs to. */
export type TimelineEntry = Role & {
  company: string;
  location: string;
  /** Only set on the first (most recent) role of each company. */
  companySummary?: string;
};
