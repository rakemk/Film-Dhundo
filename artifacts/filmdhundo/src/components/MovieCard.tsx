import { Link } from "wouter";
import { Star } from "lucide-react";
import { OTT_CONFIG, getTmdbImage } from "@/lib/ott";
import type { Movie } from "@workspace/api-client-react";

interface MovieCardProps {
  movie: Movie;
  index?: number;
}

export function MovieCard({ movie, index = 0 }: MovieCardProps) {
  const ott = OTT_CONFIG[movie.ott_platform] || { name: movie.ott_platform, color: "#666" };
  const year = movie.release_date?.slice(0, 4) || "";
  const posterUrl = getTmdbImage.posterThumb(movie.poster_path);
  const isEager = index < 6;

  return (
    <Link href={`/movies/${movie.id}`} data-testid={`card-movie-${movie.id}`}>
      <div className="movie-card group cursor-pointer rounded-[10px] border border-border overflow-hidden bg-card transition-transform duration-200 hover:-translate-y-[3px] hover:shadow-lg">
        <div className="relative aspect-[2/3] bg-muted">
          {posterUrl ? (
            <img
              src={posterUrl}
              alt={movie.title}
              loading={isEager ? "eager" : "lazy"}
              width={300}
              height={450}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground text-xs text-center px-2">
              {movie.title}
            </div>
          )}
          <span
            className="absolute top-2 right-2 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: ott.color }}
            data-testid={`badge-platform-${movie.id}`}
          >
            {ott.name.split(" ")[0]}
          </span>
        </div>
        <div className="p-2">
          <p className="text-xs font-medium text-foreground line-clamp-2 mb-1" data-testid={`text-title-${movie.id}`}>
            {movie.title}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 text-yellow-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-[11px] text-muted-foreground">{movie.vote_average}</span>
            </div>
            <div className="flex items-center gap-1">
              {year && <span className="text-[10px] text-muted-foreground">{year}</span>}
              <span className="text-[10px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                {movie.language}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
