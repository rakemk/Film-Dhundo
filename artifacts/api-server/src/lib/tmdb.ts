import axios from "axios";
import NodeCache from "node-cache";
import { logger } from "./logger";

const cache = new NodeCache({ stdTTL: 3600 });

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_API_KEY = process.env["TMDB_API_KEY"];
const YOUTUBE_API_KEY = process.env["YOUTUBE_API_KEY"];

const OTT_PLATFORMS = ["prime", "netflix", "hotstar", "zee5", "sony", "mx"];

function assignOttPlatform(movieId: number): string {
  return OTT_PLATFORMS[movieId % OTT_PLATFORMS.length];
}

function makeSlug(title: string, releaseDate: string): string {
  const year = releaseDate?.slice(0, 4) || "unknown";
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
  return `${slug}-${year}`;
}

function getLanguageLabel(langCode: string): string {
  const langs: Record<string, string> = {
    hi: "Hindi",
    en: "English",
    ta: "Tamil",
    te: "Telugu",
    ml: "Malayalam",
    kn: "Kannada",
    mr: "Marathi",
    bn: "Bengali",
    pa: "Punjabi",
  };
  return langs[langCode] || langCode.toUpperCase();
}

async function tmdbGet<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
  if (!TMDB_API_KEY) {
    throw new Error("TMDB_API_KEY not configured");
  }
  const cacheKey = path + JSON.stringify(params);
  const cached = cache.get<T>(cacheKey);
  if (cached) return cached;

  const response = await axios.get(`${TMDB_BASE}${path}`, {
    params: { api_key: TMDB_API_KEY, language: "hi-IN", ...params },
  });
  cache.set(cacheKey, response.data);
  return response.data as T;
}

interface TmdbMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date: string;
  original_language: string;
  overview: string | null;
}

interface TmdbListResponse {
  results: TmdbMovie[];
  total_pages: number;
  page: number;
}

export function formatMovie(movie: TmdbMovie) {
  return {
    id: movie.id,
    title: movie.title,
    poster_path: movie.poster_path,
    backdrop_path: movie.backdrop_path,
    vote_average: Math.round(movie.vote_average * 10) / 10,
    release_date: movie.release_date || "",
    ott_platform: assignOttPlatform(movie.id),
    slug: makeSlug(movie.title, movie.release_date),
    language: getLanguageLabel(movie.original_language),
    overview: movie.overview,
  };
}

export async function getTrending(page = 1, platform?: string) {
  try {
    const data = await tmdbGet<TmdbListResponse>("/trending/movie/week", { page });
    let movies = data.results.map(formatMovie);
    if (platform && platform !== "all") {
      movies = movies.filter((m) => m.ott_platform === platform);
    }
    return { movies, total_pages: data.total_pages, page: data.page };
  } catch (err) {
    logger.error({ err }, "TMDB trending fetch failed");
    return getMockMovies(page);
  }
}

export async function searchMovies(query: string, page = 1) {
  try {
    const data = await tmdbGet<TmdbListResponse>("/search/movie", { query, page });
    const movies = data.results.map(formatMovie);
    return { movies, total_pages: data.total_pages, page: data.page };
  } catch (err) {
    logger.error({ err }, "TMDB search failed");
    return { movies: [], total_pages: 0, page: 1 };
  }
}

export async function getNewReleases() {
  try {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const data = await tmdbGet<TmdbListResponse>("/discover/movie", {
      sort_by: "release_date.desc",
      "release_date.gte": weekAgo.toISOString().slice(0, 10),
      "release_date.lte": today.toISOString().slice(0, 10),
      with_original_language: "hi",
    });
    const movies = data.results.map(formatMovie);
    return { movies, total_pages: data.total_pages, page: 1 };
  } catch (err) {
    logger.error({ err }, "TMDB new releases failed");
    return getMockMovies(1);
  }
}

interface TmdbMovieDetail extends TmdbMovie {
  runtime: number | null;
  genres: Array<{ id: number; name: string }>;
  vote_count: number;
  credits?: {
    cast: Array<{ id: number; name: string; character: string; profile_path: string | null }>;
    crew: Array<{ id: number; name: string; job: string }>;
  };
  videos?: {
    results: Array<{ type: string; site: string; key: string }>;
  };
}

export async function getMovieDetail(id: number) {
  try {
    const data = await tmdbGet<TmdbMovieDetail>(`/movie/${id}`, {
      append_to_response: "credits,videos",
    });

    const trailer = data.videos?.results.find(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );

    const director = data.credits?.crew.find((c) => c.job === "Director");
    const cast = (data.credits?.cast || []).slice(0, 8).map((c) => ({
      id: c.id,
      name: c.name,
      character: c.character || null,
      profile_path: c.profile_path || null,
    }));

    let trailerUrl: string | null = null;
    if (trailer) {
      trailerUrl = `https://www.youtube.com/embed/${trailer.key}`;
    } else if (YOUTUBE_API_KEY) {
      try {
        const ytRes = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: {
            part: "snippet",
            q: `${data.title} ${data.release_date?.slice(0, 4)} official trailer`,
            type: "video",
            maxResults: 1,
            key: YOUTUBE_API_KEY,
          },
        });
        const items = ytRes.data?.items || [];
        if (items.length > 0) {
          trailerUrl = `https://www.youtube.com/embed/${items[0].id.videoId}`;
        }
      } catch {
        trailerUrl = null;
      }
    }

    return {
      id: data.id,
      title: data.title,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      vote_average: Math.round(data.vote_average * 10) / 10,
      vote_count: data.vote_count,
      release_date: data.release_date || "",
      runtime: data.runtime || null,
      ott_platform: assignOttPlatform(data.id),
      slug: makeSlug(data.title, data.release_date),
      language: getLanguageLabel(data.original_language),
      overview: data.overview || null,
      genres: (data.genres || []).map((g) => g.name),
      cast,
      trailer_url: trailerUrl,
      director: director?.name || null,
    };
  } catch (err) {
    logger.error({ err }, "TMDB movie detail failed, using mock");
    return getMockMovieDetail(id);
  }
}

export async function getSimilarMovies(id: number) {
  try {
    const data = await tmdbGet<TmdbListResponse>(`/movie/${id}/similar`);
    return data.results.slice(0, 12).map(formatMovie);
  } catch (err) {
    logger.error({ err }, "TMDB similar movies failed");
    return [];
  }
}

function getMockMovieDetail(id: number) {
  const MOCK_DETAILS: Record<number, { title: string; lang: string; overview: string; genres: string[] }> = {
    1000: { title: "Pathaan", lang: "hi", overview: "Pathaan ek RAW agent hai jo India ko bachata hai.", genres: ["Action", "Thriller"] },
    1001: { title: "RRR", lang: "te", overview: "RRR do legendary freedom fighters ki kahani hai.", genres: ["Action", "Drama", "History"] },
    1002: { title: "KGF Chapter 2", lang: "kn", overview: "Rocky bhai ki satta ki aur badi kahani.", genres: ["Action", "Crime"] },
    1003: { title: "Brahmastra", lang: "hi", overview: "Ek superhero ki kahani jo brahmanda ki shakti rakhta hai.", genres: ["Fantasy", "Action"] },
    1004: { title: "Drishyam 2", lang: "hi", overview: "Vijay Salgaonkar apne parivar ko bachane ki koshish karta hai.", genres: ["Thriller", "Drama"] },
    1005: { title: "Animal", lang: "hi", overview: "Ek betay ki apne baap se pyar aur nafrat ki kahani.", genres: ["Action", "Drama"] },
    1006: { title: "Jawan", lang: "hi", overview: "Ek jail warden aur ek army officer ki double life.", genres: ["Action", "Thriller"] },
    1007: { title: "Gadar 2", lang: "hi", overview: "Tara Singh apne betay ke liye Pakistan jaata hai.", genres: ["Action", "Romance"] },
    1008: { title: "Tu Jhoothi Main Makkaar", lang: "hi", overview: "Breakup specialist ki kahani jo khud pyar mein pad jaata hai.", genres: ["Romance", "Comedy"] },
    1009: { title: "OMG 2", lang: "hi", overview: "Ek baap apne betay ke liye insaaf maangta hai.", genres: ["Drama", "Comedy"] },
    1010: { title: "Dunki", lang: "hi", overview: "Dosto ki videsh jaane ki nakami bhari yatra.", genres: ["Drama", "Comedy"] },
    1011: { title: "Tiger 3", lang: "hi", overview: "Tiger ko apna naam saaf karna padta hai.", genres: ["Action", "Spy"] },
  };

  const detail = MOCK_DETAILS[id] || {
    title: `Film #${id}`,
    lang: "hi",
    overview: "Ek superhit Bollywood film.",
    genres: ["Drama", "Action"],
  };

  return {
    id,
    title: detail.title,
    poster_path: null,
    backdrop_path: null,
    vote_average: 7.5,
    vote_count: 10000,
    release_date: "2023-06-15",
    runtime: 148,
    ott_platform: assignOttPlatform(id),
    slug: makeSlug(detail.title, "2023-06-15"),
    language: getLanguageLabel(detail.lang),
    overview: detail.overview,
    genres: detail.genres,
    cast: [
      { id: 1, name: "Shah Rukh Khan", character: "Hero", profile_path: null },
      { id: 2, name: "Deepika Padukone", character: "Heroine", profile_path: null },
    ],
    trailer_url: null,
    director: "Siddharth Anand",
  };
}

function getMockMovies(page: number) {
  const MOCK_TITLES = [
    { title: "Pathaan", lang: "hi" },
    { title: "RRR", lang: "te" },
    { title: "KGF Chapter 2", lang: "kn" },
    { title: "Brahmastra", lang: "hi" },
    { title: "Drishyam 2", lang: "hi" },
    { title: "Animal", lang: "hi" },
    { title: "Jawan", lang: "hi" },
    { title: "Gadar 2", lang: "hi" },
    { title: "Tu Jhoothi Main Makkaar", lang: "hi" },
    { title: "OMG 2", lang: "hi" },
    { title: "Dunki", lang: "hi" },
    { title: "Tiger 3", lang: "hi" },
  ];

  const movies = MOCK_TITLES.map((m, i) => {
    const id = 1000 + i + (page - 1) * MOCK_TITLES.length;
    return {
      id,
      title: m.title,
      poster_path: null,
      backdrop_path: null,
      vote_average: 7 + Math.round(Math.random() * 20) / 10,
      release_date: "2023-01-01",
      ott_platform: assignOttPlatform(id),
      slug: makeSlug(m.title, "2023-01-01"),
      language: getLanguageLabel(m.lang),
      overview: `${m.title} ek blockbuster film hai.`,
    };
  });

  return { movies, total_pages: 5, page };
}
