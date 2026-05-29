export const OTT_CONFIG: Record<string, { name: string; color: string; affiliateUrl: string; buttonText: string }> = {
  prime: { name: "Amazon Prime Video", color: "#00A8E0", affiliateUrl: "https://www.primevideo.com/?tag=freefilm-21", buttonText: "Prime pe Dekho" },
  netflix: { name: "Netflix", color: "#E50914", affiliateUrl: "https://www.netflix.com/in", buttonText: "Netflix pe Dekho" },
  hotstar: { name: "Disney+ Hotstar", color: "#1F80E0", affiliateUrl: "https://www.hotstar.com/in", buttonText: "Hotstar pe Dekho" },
  zee5: { name: "ZEE5", color: "#7B2D8B", affiliateUrl: "https://www.zee5.com", buttonText: "ZEE5 pe Dekho" },
  sony: { name: "SonyLIV", color: "#0057A8", affiliateUrl: "https://www.sonyliv.com", buttonText: "SonyLIV pe Dekho" },
  mx: { name: "MX Player", color: "#FF6B35", affiliateUrl: "https://www.mxplayer.in", buttonText: "MX pe Muft Dekho" },
};

export const FREE_PLATFORMS = {
  mx: {
    id: "mx",
    name: "MX Player",
    color: "#FF6B35",
    watchUrl: "https://www.mxplayer.in",
    isFree: true,
    tmdbProviderId: 11,
  },
  minitv: {
    id: "minitv",
    name: "Amazon MiniTV",
    color: "#00A8E0",
    watchUrl: "https://www.amazon.in/minitv?tag=freefilm-21",
    isFree: true,
    isHiddenGem: true,
    tmdbProviderId: null,
  },
  youtube: {
    id: "youtube",
    name: "YouTube",
    color: "#FF0000",
    watchUrl: "https://www.youtube.com",
    isFree: true,
    tmdbProviderId: null,
  },
  jiocinema: {
    id: "jiocinema",
    name: "JioCinema",
    color: "#8B5CF6",
    watchUrl: "https://www.jiocinema.com",
    isFree: true,
    tmdbProviderId: 220,
  },
  zee5free: {
    id: "zee5free",
    name: "ZEE5 Free",
    color: "#7B2D8B",
    watchUrl: "https://www.zee5.com",
    isFree: true,
    tmdbProviderId: 232,
  },
  hotstarfree: {
    id: "hotstarfree",
    name: "Hotstar Free",
    color: "#1F80E0",
    watchUrl: "https://www.hotstar.com/in",
    isFree: true,
    tmdbProviderId: 122,
  },
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
