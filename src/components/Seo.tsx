import { useEffect } from "react";

interface SeoProps {
  title: string;
  description?: string;
}

/** Creates or updates a <meta> tag identified by `name` or `property`. */
function setMeta(attr: "name" | "property", key: string, content: string) {
  let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attr, key);
    document.head.appendChild(meta);
  }
  meta.setAttribute("content", content);
}

/** Per-page title and description, mirrored to Open Graph and Twitter tags for link previews. */
export default function Seo({ title, description }: SeoProps) {
  useEffect(() => {
    document.title = title;
    setMeta("property", "og:title", title);
    setMeta("name", "twitter:title", title);

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }
  }, [title, description]);

  return null;
}
