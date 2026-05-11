import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { useSearchMovies, getSearchMoviesQueryKey } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const { data, isLoading } = useSearchMovies(
    { q: debouncedQuery },
    { query: { enabled: debouncedQuery.length >= 2, queryKey: getSearchMoviesQueryKey({ q: debouncedQuery }) } }
  );

  const movies = data?.movies || [];
  const suggestions = movies.slice(0, 5);
  const showResults = debouncedQuery.length >= 2;

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    queryClient.cancelQueries();
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <div className="relative max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              placeholder="Movie ya series dhundo..."
              className="w-full pl-10 pr-10 py-3 text-base rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              data-testid="input-search"
            />
            {query && (
              <button onClick={handleClear} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" data-testid="button-search-clear">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {showSuggestions && query.length >= 2 && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-20">
              {suggestions.map((movie) => (
                <a
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted transition-colors"
                  data-testid={`suggestion-${movie.id}`}
                >
                  {movie.poster_path && (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                      alt={movie.title}
                      className="w-8 h-12 object-cover rounded"
                    />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{movie.title}</p>
                    <p className="text-xs text-muted-foreground">{movie.release_date?.slice(0, 4)} · {movie.language}</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>

        {!showResults && (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-base">Koi bhi Bollywood ya Hollywood movie dhundiye</p>
            <p className="text-sm mt-1">Type karein aur results dekhen</p>
          </div>
        )}

        {showResults && isLoading && (
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
        )}

        {showResults && !isLoading && movies.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg font-medium">Koi result nahi mila</p>
            <p className="text-sm mt-1">"{debouncedQuery}" ke liye koi movie nahi mili. Dusra naam try karein.</p>
          </div>
        )}

        {showResults && !isLoading && movies.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-4">
              "{debouncedQuery}" ke liye {movies.length} results mile
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
              {movies.map((movie, i) => (
                <MovieCard key={movie.id} movie={movie} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
