/** Window-bar label for a project: the real host + path of its live URL, or "Live demo". */
export function liveLabel(href?: string): string {
  if (!href) return "Live demo";
  try {
    const url = new URL(href, window.location.origin);
    return `${url.host}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return "Live demo";
  }
}
