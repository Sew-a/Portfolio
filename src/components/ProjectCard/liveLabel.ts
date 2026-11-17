/** Window-bar label for a project: the path for pages on this site (e.g. "/game"),
 *  the host + path for external sites, or "Live demo". */
export function liveLabel(href?: string): string {
  if (!href) return "Live demo";
  if (href.startsWith("/")) return href;
  try {
    const url = new URL(href);
    return `${url.host}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return "Live demo";
  }
}
