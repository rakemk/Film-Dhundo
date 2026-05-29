import { useEffect } from "react";

function setMeta(nameOrProp: string, attr: string, value: string) {
  let el = document.querySelector<HTMLMetaElement>(`${nameOrProp}`);
  if (!el) {
    el = document.createElement("meta");
    const [attrName, attrVal] = attr.split("=");
    el.setAttribute(attrName, attrVal);
    document.head.appendChild(el);
  }
  el.setAttribute("content", value);
}

export default function SeoHead({
  title,
  description,
  image,
  url,
  type = "website",
  jsonLd,
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: string;
  jsonLd?: unknown;
}) {
  useEffect(() => {
    const oldTitle = document.title;
    if (title) document.title = title;

    if (description) setMeta('meta[name="description"]', 'name=description', description);
    if (title) setMeta('meta[property="og:title"]', 'property=og:title', title);
    if (description) setMeta('meta[property="og:description"]', 'property=og:description', description);
    if (image) setMeta('meta[property="og:image"]', 'property=og:image', image);
    if (url) setMeta('meta[property="og:url"]', 'property=og:url', url);
    setMeta('meta[property="og:type"]', 'property=og:type', type || 'website');

    // canonical link
    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    if (url) canonical.setAttribute('href', url);

    // JSON-LD
    let jsonScript = document.getElementById('film-dhundo-jsonld') as HTMLScriptElement | null;
    if (!jsonScript) {
      jsonScript = document.createElement('script');
      jsonScript.type = 'application/ld+json';
      jsonScript.id = 'film-dhundo-jsonld';
      document.head.appendChild(jsonScript);
    }
    if (jsonLd) jsonScript.textContent = JSON.stringify(jsonLd);

    return () => {
      document.title = oldTitle;
      // cleanup only the values we set (leave other tags intact)
      if (description) setMeta('meta[name="description"]', 'name=description', 'FilmDhundo — India ke sabse bade OTT platforms pe movies dhundein.');
      if (title) setMeta('meta[property="og:title"]', 'property=og:title', 'FilmDhundo');
      if (description) setMeta('meta[property="og:description"]', 'property=og:description', 'Indian OTT guide to find where to watch Bollywood and Hollywood movies.');
      if (image) setMeta('meta[property="og:image"]', 'property=og:image', '');
      if (url) setMeta('meta[property="og:url"]', 'property=og:url', window.location.origin + (window.location.pathname || '/'));
      if (jsonScript) {
        try { jsonScript.remove(); } catch {};
      }
    };
  }, [title, description, image, url, type, jsonLd]);

  return null;
}
