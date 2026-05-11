export const OTT_CONFIG: Record<string, { name: string; color: string; affiliateUrl: string; buttonText: string }> = {
  prime: { name: "Amazon Prime Video", color: "#00A8E0", affiliateUrl: "https://amzn.to/REPLACE", buttonText: "Prime pe Dekho" },
  netflix: { name: "Netflix", color: "#E50914", affiliateUrl: "https://netflix.com?ref=REPLACE", buttonText: "Netflix pe Dekho" },
  hotstar: { name: "Disney+ Hotstar", color: "#1F80E0", affiliateUrl: "https://REPLACE", buttonText: "Hotstar pe Dekho" },
  zee5: { name: "ZEE5", color: "#7B2D8B", affiliateUrl: "https://REPLACE", buttonText: "ZEE5 pe Dekho" },
  sony: { name: "SonyLIV", color: "#0057A8", affiliateUrl: "https://REPLACE", buttonText: "SonyLIV pe Dekho" },
  mx: { name: "MX Player", color: "#FF6B35", affiliateUrl: "https://mxplayer.in?ref=REPLACE", buttonText: "MX pe Muft Dekho" },
};

export const getTmdbImage = {
  posterThumb: (path: string | null | undefined) => path ? `https://image.tmdb.org/t/p/w300${path}` : '',
  posterFull: (path: string | null | undefined) => path ? `https://image.tmdb.org/t/p/w500${path}` : '',
  backdrop: (path: string | null | undefined) => path ? `https://image.tmdb.org/t/p/w1280${path}` : '',
  profile: (path: string | null | undefined) => path ? `https://image.tmdb.org/t/p/w185${path}` : '',
};

export const generateSlug = (title: string, year?: string | number) => {
  const base = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  return year ? `${base}-${year}` : base;
};
