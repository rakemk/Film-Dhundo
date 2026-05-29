import { useState, useEffect, useRef } from "react";
import { useGetTrendingMovies, useGetNewReleases } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { useFamilySafe } from "@/hooks/useFamilySafe";
import { MovieCard } from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import type { Movie } from "@workspace/api-client-react";
import { FREE_PLATFORMS } from "@/lib/ott";

const PLATFORM_TABS = [
  { label: "Sab Kuch", value: "all" },
  { label: "Prime Video", value: "prime" },
  { label: "Netflix", value: "netflix" },
  { label: "Hotstar", value: "hotstar" },
  { label: "ZEE5", value: "zee5" },
  { label: "SonyLIV", value: "sony" },
  { label: "MX Player", value: "mx" },
  { label: "MiniTV", value: "minitv" },
  { label: "YouTube", value: "youtube" },
  { label: "JioCinema", value: "jiocinema" },
  { label: "Marathi", value: "marathi" },
  { label: "Hindi", value: "hindi" },
  { label: "Is Hafte Naya", value: "new" },
];

function MovieGrid({ movies, loading }: { movies: Movie[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-[10px] border border-border overflow-hidden">
            <Skeleton className="aspect-[2/3] w-full" />
            <div className="p-2 space-y-1">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!movies.length) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg">Koi movie nahi mili</p>
        <p className="text-sm mt-1">Dusra platform try karein</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
      {movies.map((movie, i) => (
        <MovieCard key={movie.id} movie={movie} index={i} />
      ))}
    </div>
  );
}

export default function HomePage() {
  const [platform, setPlatform] = useState("all");
  const [page, setPage] = useState(1);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);
  const { isFamilySafe } = useFamilySafe();

  const { data: trendingData, isLoading } = useGetTrendingMovies(
    platform === "all" || platform === "new" ? { page } : { page, platform },
  );

  const { data: newReleasesData, isLoading: newReleasesLoading } = useGetNewReleases();

  useEffect(() => {
    setAllMovies([]);
    setPage(1);
    setHasMore(true);
  }, [platform]);

  useEffect(() => {
    if (trendingData?.movies) {
      // If user selected a free-platform tab, filter client-side using FREE_PLATFORMS keys
      const freeKeys = Object.keys(FREE_PLATFORMS);
      const applyFilter = (movies: Movie[]) => {
        let out = movies;
        if (platform && freeKeys.includes(platform)) {
          out = out.filter((m) => (m.ott_platforms || []).includes(platform) || m.ott_platform === platform);
        }
        if (isFamilySafe) {
          out = out.filter((m) => (m as any).age_rating === "U" || (m as any).age_rating === "UA");
        }
        return out;
      };

      if (page === 1) {
        setAllMovies(applyFilter(trendingData.movies));
      } else {
        setAllMovies((prev) => {
          const existingIds = new Set(prev.map((m) => m.id));
          const newMovies = applyFilter(trendingData.movies).filter((m) => !existingIds.has(m.id));
          return [...prev, ...newMovies];
        });
      }
      setHasMore(page < (trendingData.total_pages || 1));
    }
  }, [trendingData, page]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && hasMore && !isLoading) {
          setPage((p) => p + 1);
        }
      },
      { threshold: 0.1 },
    );
    const el = loaderRef.current;
    if (el) observer.observe(el);
    return () => { if (el) observer.unobserve(el); };
  }, [hasMore, isLoading]);

  const newReleases = newReleasesData?.movies?.slice(0, 12) || [];
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [upcomingLoading, setUpcomingLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    setUpcomingLoading(true);
    fetch('/api/movies/upcoming')
      .then((r) => r.json())
      .then((data) => {
        if (!mounted) return;
        setUpcoming(data.movies || []);
      })
      .catch(() => {
        if (!mounted) return;
        setUpcoming([]);
      })
      .finally(() => {
        if (!mounted) return;
        setUpcomingLoading(false);
      });
    return () => { mounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMobileSearchChange={setMobileSearchOpen} />

      <div className="max-w-screen-xl mx-auto px-4 py-4">
        <div className="flex items-center gap-4 py-3 mb-4 text-sm text-muted-foreground border-b border-border flex-wrap">
          <span>
            <span className="text-primary font-semibold">6</span> OTT Platforms
          </span>
          <span className="text-border">·</span>
          <span>
            <span className="text-primary font-semibold">Free</span> Subscription Nahi
          </span>
          <span className="text-border">·</span>
          <span>
            <span className="text-primary font-semibold">Daily</span> Updated
          </span>
        </div>

        {/* MiniTV Spotlight: Amazon MiniTV — Yeh Sab Free Hai! */}
        <section className="mb-6">
          <div className="rounded-lg border border-border" style={{ borderLeft: "3px solid #00A8E0", padding: 16, margin: '16px 0' }}>
            <h3 className="text-lg font-semibold text-foreground mb-2">Amazon MiniTV — Yeh Sab Free Hai!</h3>
            <p className="text-sm text-muted-foreground" style={{ color: '#666666' }}>Jaante the? Koi subscription nahi chahiye</p>

            <div className="flex gap-3 overflow-x-auto pb-3 pt-3">
                  {(() => {
                    const mini = (trendingData?.movies || []).filter((m) => (m.ott_platforms || []).includes('mx') || m.ott_platform === 'mx').slice(0, 6);
                    const picks = mini.length ? mini : (trendingData?.movies || []).slice(0, 6);
                    return picks.map((movie, i) => (
                      <div key={movie.id} className="shrink-0 w-32">
                        <div className="shrink-0 w-32 rounded-[10px] border border-border overflow-hidden">
                          <MovieCard movie={movie} index={i} />
                        </div>
                      </div>
                    ));
                  })()}
            </div>
          </div>
        </section>

        <div className={`flex gap-2 overflow-x-auto pb-3 mb-6 scrollbar-hide ${mobileSearchOpen ? "hidden sm:flex" : "flex"}`}>
          {PLATFORM_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setPlatform(tab.value)}
              data-testid={`tab-platform-${tab.value}`}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                platform === tab.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">
            {platform === "all" ? "Trending Movies" : PLATFORM_TABS.find((t) => t.value === platform)?.label}
          </h2>
          <MovieGrid movies={allMovies} loading={isLoading && page === 1} />
          {hasMore && (
            <div ref={loaderRef} className="flex justify-center py-8">
              {isLoading && page > 1 && (
                <p className="text-sm text-muted-foreground">Movies la rahe hain...</p>
              )}
            </div>
          )}
        </section>

        {newReleases.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">Is Hafte Kya Naya</h2>
            {newReleasesLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-32 rounded-[10px] border border-border overflow-hidden">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <div className="p-2"><Skeleton className="h-3 w-full" /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-3">
                {newReleases.map((movie, i) => (
                  <div key={movie.id} className="shrink-0 w-32">
                    <MovieCard movie={movie} index={i} />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {upcoming.length >= 3 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-foreground mb-4">Aane Wali Filmen (Coming Soon)</h2>
            {upcomingLoading ? (
              <div className="flex gap-3 overflow-x-auto pb-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-32 rounded-[10px] border border-border overflow-hidden">
                    <Skeleton className="aspect-[2/3] w-full" />
                    <div className="p-2"><Skeleton className="h-3 w-full" /></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex gap-3 overflow-x-auto pb-3">
                {upcoming.map((movie, i) => (
                  <div key={movie.id} className="shrink-0 w-32">
                    <MovieCard movie={movie} index={i} />
                    <div className="text-xs text-center text-muted-foreground mt-1">
                      {typeof movie.days_until_release === 'number' && movie.days_until_release > 0
                        ? `${movie.days_until_release} din mein`
                        : 'Aaj'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
      </div>

      <footer className="mt-12 border-t border-border py-6 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-6">
          <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="/about" className="hover:text-foreground transition-colors">About</a>
          <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        <p className="mt-3 text-xs">© 2025 FilmDhundo — India ka OTT Guide</p>
      </footer>
    </div>
  );
}
