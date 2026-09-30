import { routeNames, paths } from "@/src/routes/mainRoutes";

export const headerRoutes = routeNames.filter((r) => r.path !== paths.resume);

export const HEADER_BRAND = "Sev";

export const SCROLL_THRESHOLD = 20;
/** Exact match, or a nested path of a non-root route (e.g. /chat/:groupId → Chat). */
export const isActiveRoute = (pathname: string, path: string) =>
  pathname === path || (path !== paths.home && pathname.startsWith(`${path}/`));
