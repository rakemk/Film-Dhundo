import { useParams, Link } from "wouter";
import { Star, Clock, Calendar, Share2, Bookmark, BookmarkCheck, ChevronLeft } from "lucide-react";
import { FaWhatsapp, FaFacebook } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import {
  useGetMovieById,
  useGetSimilarMovies,
  useAddToWatchlist,
  getGetMovieByIdQueryKey,
  getGetSimilarMoviesQueryKey,
  type MovieDetail,
} from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { MovieCard } from "@/components/MovieCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { OTT_CONFIG, getTmdbImage } from "@/lib/ott";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

function FAQSection({ title, ottName, language }: { title: string; ottName: string; language: string }) {
  const faqs = [
    { q: `${title} kahan dekhein?`, a: `${title} ${ottName} pe available hai.` },
    { q: `${title} free mein kaise dekhein?`, a: `${ottName} ka free trial lo.` },
    { q: `${title} Hindi mein hai?`, a: `Haan, ${title} ${language} mein available hai.` },
  ];
  return (
    <div className="mt-8">
      <h3 className="text-base font-semibold text-foreground mb-3">Aksar Puche Jane Wale Sawal</h3>
      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-lg border border-border p-4 bg-card">
            <p className="text-sm font-medium text-foreground mb-1">{faq.q}</p>
            <p className="text-sm text-muted-foreground">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MovieDetailPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const { toast } = useToast();
  const [inWatchlist, setInWatchlist] = useState(false);
  const addToWatchlist = useAddToWatchlist();

  const { data: movie, isLoading } = useGetMovieById(id, {
    query: { enabled: !!id, queryKey: getGetMovieByIdQueryKey(id) },
  });

  const { data: similar } = useGetSimilarMovies(id, {
    query: { enabled: !!id, queryKey: getGetSimilarMoviesQueryKey(id) },
  });

  useEffect(() => {
    if (movie) {
      const stored = JSON.parse(localStorage.getItem("filmdhundo_watchlist") || "[]");
      setInWatchlist(stored.includes(movie.id));
      document.title = `${movie.title} (${movie.release_date?.slice(0, 4)}) — ${OTT_CONFIG[movie.ott_platform]?.name || movie.ott_platform} pe Dekho | FilmDhundo`;
    }
  }, [movie]);

  const handleWatchlist = () => {
    if (!movie) return;
    const stored: number[] = JSON.parse(localStorage.getItem("filmdhundo_watchlist") || "[]");
    if (inWatchlist) {
      const updated = stored.filter((id) => id !== movie.id);
      localStorage.setItem("filmdhundo_watchlist", JSON.stringify(updated));
      setInWatchlist(false);
      toast({ title: "Watchlist se hataya" });
    } else {
      addToWatchlist.mutate(
        { data: { userId: "guest", movieId: movie.id, title: movie.title, poster_path: movie.poster_path || null, ott_platform: movie.ott_platform, slug: movie.slug } },
        {
          onSuccess: () => {
            stored.push(movie.id);
            localStorage.setItem("filmdhundo_watchlist", JSON.stringify(stored));
            setInWatchlist(true);
            toast({ title: "Watchlist mein add kiya", description: "Baad mein yahan dekhein" });
          },
          onError: (err: unknown) => {
            const msg = err instanceof Error ? err.message : "Kuch galat hua";
            toast({ title: "Error", description: msg, variant: "destructive" });
          },
        }
      );
    }
  };

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = movie ? `${movie.title} ${OTT_CONFIG[movie.ott_platform]?.name || movie.ott_platform} pe available hai! Yahan dekho: ${shareUrl}` : "";

  const ott = movie ? (OTT_CONFIG[movie.ott_platform] || { name: movie.ott_platform, color: "#666", affiliateUrl: "#", buttonText: "Dekho" }) : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-screen-xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-8">
            <Skeleton className="w-full md:w-64 aspect-[2/3] rounded-xl shrink-0" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-48" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="text-center py-24 text-muted-foreground">
          <p className="text-xl">Movie nahi mili</p>
          <Link href="/" className="text-primary text-sm mt-2 inline-block">Homepage pe jaiye</Link>
        </div>
      </div>
    );
  }

  const year = movie.release_date?.slice(0, 4) || "";
  const posterUrl = getTmdbImage.posterFull(movie.poster_path);
  const backdropUrl = getTmdbImage.backdrop(movie.backdrop_path);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: movie.title,
    datePublished: year,
    description: movie.overview || "",
    image: backdropUrl || posterUrl,
    genre: movie.genres,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: movie.vote_average,
      ratingCount: movie.vote_count || 0,
      bestRating: "10",
      worstRating: "1",
    },
    director: movie.director ? { "@type": "Person", name: movie.director } : undefined,
    actor: movie.cast?.map((c) => ({ "@type": "Person", name: c.name })),
  };

  return (
    <div className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {backdropUrl && (
        <div className="relative h-32 md:h-48 overflow-hidden">
          <img src={backdropUrl} alt="" className="w-full h-full object-cover opacity-40" loading="eager" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}

      <div className="max-w-screen-xl mx-auto px-4 py-6">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors" data-testid="link-back">
          <ChevronLeft className="w-4 h-4" /> Wapas jaiye
        </Link>

        <nav className="text-xs text-muted-foreground mb-6 flex items-center gap-1.5">
          <a href="/" className="hover:text-foreground">FilmDhundo</a>
          <span>/</span>
          <span>Movies</span>
          <span>/</span>
          <span className="text-foreground">{movie.title}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="shrink-0 w-full md:w-56">
            {posterUrl ? (
              <img
                src={posterUrl}
                alt={movie.title}
                loading="eager"
                width={500}
                height={750}
                className="w-full md:w-56 rounded-xl shadow-lg border border-border"
                data-testid="img-poster"
              />
            ) : (
              <div className="w-full md:w-56 aspect-[2/3] rounded-xl bg-muted flex items-center justify-center text-muted-foreground text-sm">
                {movie.title}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1" data-testid="text-movie-title">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-4">
              {year && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{year}</span>}
              {movie.runtime && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{movie.runtime} min</span>}
              <span className="flex items-center gap-1 text-yellow-500"><Star className="w-3.5 h-3.5 fill-current" /><span className="text-foreground font-medium">{movie.vote_average}</span>/10</span>
              <span className="bg-secondary text-secondary-foreground px-2 py-0.5 rounded text-xs">{movie.language}</span>
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((g) => (
                  <span key={g} className="text-xs px-2 py-1 rounded-full border border-border text-muted-foreground">{g}</span>
                ))}
              </div>
            )}

            {movie.overview && (
              <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-2xl">{movie.overview}</p>
            )}

            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Kahan Dekhein</h2>
              <div className="flex flex-wrap gap-3">
                {ott && (
                  <a
                    href={ott.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: ott.color }}
                    data-testid="button-ott-watch"
                  >
                    {ott.buttonText}
                  </a>
                )}
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={handleWatchlist}
                  data-testid="button-watchlist"
                >
                  {inWatchlist ? <BookmarkCheck className="w-4 h-4 text-primary" /> : <Bookmark className="w-4 h-4" />}
                  {inWatchlist ? "Watchlist mein hai" : "Baad Mein Dekho"}
                </Button>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Dosto Ko Batao</h2>
              <div className="flex gap-3">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  data-testid="button-share-whatsapp"
                >
                  <FaWhatsapp className="w-4 h-4" /> WhatsApp
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1877F2] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  data-testid="button-share-facebook"
                >
                  <FaFacebook className="w-4 h-4" /> Facebook
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:opacity-90 transition-opacity"
                  data-testid="button-share-twitter"
                >
                  <FaXTwitter className="w-4 h-4" /> X
                </a>
              </div>
            </div>

            {movie.director && (
              <p className="text-sm text-muted-foreground mb-4">
                <span className="font-medium text-foreground">Director:</span> {movie.director}
              </p>
            )}
          </div>
        </div>

        {movie.trailer_url && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-foreground mb-3">Trailer Dekhein</h2>
            <div className="relative aspect-video max-w-2xl rounded-xl overflow-hidden border border-border">
              <iframe
                src={movie.trailer_url}
                title={`${movie.title} Trailer`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
                data-testid="iframe-trailer"
              />
            </div>
          </div>
        )}

        {movie.cast && movie.cast.length > 0 && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-foreground mb-3">Cast</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {movie.cast.map((member) => (
                <div key={member.id} className="shrink-0 w-20 text-center" data-testid={`card-cast-${member.id}`}>
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted border border-border mb-1">
                    {member.profile_path ? (
                      <img
                        src={getTmdbImage.profile(member.profile_path)}
                        alt={member.name}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        {member.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-foreground line-clamp-2">{member.name}</p>
                  {member.character && <p className="text-[10px] text-muted-foreground line-clamp-1">{member.character}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {similar && similar.length > 0 && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-foreground mb-3">Isse Milti Julti Movies</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {similar.map((m, i) => (
                <div key={m.id} className="shrink-0 w-32">
                  <MovieCard movie={m} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        <FAQSection title={movie.title} ottName={ott?.name || movie.ott_platform} language={movie.language} />
      </div>
    </div>
  );
}
