import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "wouter";
import { Search, Bookmark, Crown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSearchMovies, getSearchMoviesQueryKey } from "@workspace/api-client-react";
import { getTmdbImage, OTT_CONFIG } from "@/lib/ott";

interface NavbarProps {
  onSearchClick?: () => void;
  onMobileSearchChange?: (open: boolean) => void;
}

export function Navbar({ onSearchClick, onMobileSearchChange }: NavbarProps) {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileQuery, setMobileQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(mobileQuery), 300);
    return () => clearTimeout(t);
  }, [mobileQuery]);

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setMenuOpen(false);
    onMobileSearchChange?.(true);
    setTimeout(() => inputRef.current?.focus(), 80);
  };

  const closeMobileSearch = () => {
    setMobileSearchOpen(false);
    setMobileQuery("");
    setDebouncedQuery("");
    onMobileSearchChange?.(false);
  };

  const { data: searchData } = useSearchMovies(
    { q: debouncedQuery },
    {
      query: {
        enabled: debouncedQuery.length >= 2,
        queryKey: getSearchMoviesQueryKey({ q: debouncedQuery }),
      },
    }
  );

  const results = searchData?.movies?.slice(0, 6) ?? [];

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-1 shrink-0" data-testid="link-home">
          <span className="text-xl font-bold text-primary">Film</span>
          <span className="text-xl font-bold text-foreground">Dhundo</span>
        </Link>

        {/* Desktop search bar */}
        <button
          className="flex-1 max-w-md hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground text-sm hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { setLocation("/search"); onSearchClick?.(); }}
          data-testid="button-search-bar"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span>Movie ya series dhundo...</span>
        </button>

        {/* Desktop nav links */}
        <nav className="hidden sm:flex items-center gap-2 ml-auto">
          <Link href="/watchlist" data-testid="link-watchlist">
            <Button variant="ghost" size="icon" aria-label="Watchlist">
              <Bookmark className="w-5 h-5" />
            </Button>
          </Link>
          <Link href="/premium" data-testid="link-premium">
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5">
              <Crown className="w-4 h-4" />
              Premium
            </Button>
          </Link>
          <Link href="/admin" data-testid="link-admin">
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs">Admin</Button>
          </Link>
        </nav>

        {/* Mobile right-side icons */}
        <div className="sm:hidden flex items-center gap-1 ml-auto">
          {!mobileSearchOpen && (
            <button
              onClick={openMobileSearch}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Search"
              data-testid="button-mobile-search-icon"
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          {mobileSearchOpen ? (
            <button
              onClick={closeMobileSearch}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close search"
              data-testid="button-mobile-search-close"
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Menu"
              data-testid="button-menu-toggle"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          )}
        </div>
      </div>

      {/* Mobile expandable search bar */}
      {mobileSearchOpen && (
        <div className="sm:hidden border-t border-border bg-background px-3 py-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              ref={inputRef}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              value={mobileQuery}
              onChange={(e) => setMobileQuery(e.target.value)}
              placeholder="Movie ya series dhundo..."
              className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary"
              data-testid="input-mobile-search"
            />
          </div>

          {/* Inline results */}
          {debouncedQuery.length >= 2 && (
            <div className="mt-2 rounded-xl border border-border bg-card overflow-hidden shadow-md max-h-[60vh] overflow-y-auto">
              {results.length === 0 ? (
                <p className="px-4 py-4 text-sm text-muted-foreground text-center">
                  "{debouncedQuery}" ke liye koi result nahi mila
                </p>
              ) : (
                results.map((movie) => {
                  const ott = OTT_CONFIG[movie.ott_platforms?.[0] ?? movie.ott_platform];
                  const posterUrl = getTmdbImage.posterThumb(movie.poster_path);
                  return (
                    <a
                      key={movie.id}
                      href={`/movies/${movie.id}`}
                      onClick={closeMobileSearch}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-muted active:bg-muted transition-colors border-b border-border last:border-0"
                      data-testid={`mobile-result-${movie.id}`}
                    >
                      <div className="w-9 h-14 shrink-0 rounded overflow-hidden bg-muted">
                        {posterUrl ? (
                          <img src={posterUrl} alt={movie.title} className="w-full h-full object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-[9px] text-center px-0.5">
                            {movie.title}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground line-clamp-1">{movie.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground">{movie.release_date?.slice(0, 4)}</span>
                          {ott && (
                            <span
                              className="text-[10px] text-white font-semibold px-1.5 py-0.5 rounded-full"
                              style={{ backgroundColor: ott.color }}
                            >
                              {ott.name.split(" ")[0]}
                            </span>
                          )}
                          {!ott && (
                            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">
                              Aani Hai
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-yellow-500 shrink-0">★ {movie.vote_average}</span>
                    </a>
                  );
                })
              )}
              {results.length > 0 && (
                <button
                  onClick={() => { setLocation(`/search?q=${encodeURIComponent(debouncedQuery)}`); closeMobileSearch(); }}
                  className="w-full px-4 py-3 text-sm text-primary font-medium text-center hover:bg-muted transition-colors"
                  data-testid="button-mobile-see-all"
                >
                  Sab {searchData?.movies?.length ?? results.length} results dekho →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Mobile hamburger menu */}
      {menuOpen && !mobileSearchOpen && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-3">
          <div className="flex gap-2">
            <Link href="/watchlist" onClick={() => setMenuOpen(false)} className="flex-1" data-testid="link-watchlist-mobile">
              <Button variant="outline" className="w-full gap-2" size="sm">
                <Bookmark className="w-4 h-4" /> Watchlist
              </Button>
            </Link>
            <Link href="/premium" onClick={() => setMenuOpen(false)} className="flex-1" data-testid="link-premium-mobile">
              <Button className="w-full gap-2 bg-primary text-primary-foreground" size="sm">
                <Crown className="w-4 h-4" /> Premium
              </Button>
            </Link>
          </div>
          <Link href="/admin" onClick={() => setMenuOpen(false)}>
            <Button variant="ghost" size="sm" className="text-muted-foreground text-xs w-full">Admin Panel</Button>
          </Link>
        </div>
      )}
    </header>
  );
}
