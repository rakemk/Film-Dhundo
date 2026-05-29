import { useParams, Link } from "wouter";
import { Star, Clock, Calendar, Bookmark, BookmarkCheck, ChevronLeft } from "lucide-react";
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
import SeoHead from "@/components/SeoHead";
import { useWatchCount } from "@/hooks/useWatchCount";
import { useToast } from "@/hooks/use-toast";

function FAQSection({ title, ottNames, language }: { title: string; ottNames: string[]; language: string }) {
  const primaryOtt = ottNames[0] || "OTT platforms";
  const allOtts = ottNames.length > 1 ? ottNames.join(", ") : primaryOtt;
  const faqs = [
    { q: `${title} kahan dekhein?`, a: ottNames.length ? `${title} ${allOtts} pe available hai.` : `${title} abhi kisi Indian OTT pe available nahi hai.` },
    { q: `${title} free mein kaise dekhein?`, a: ottNames.length ? `${primaryOtt} ka free trial lo.` : "Abhi OTT date announce nahi hui hai." },
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

function getStoredWatchlistIds(): number[] {
  try {
    const raw = localStorage.getItem("filmdhundo_watchlist");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id): id is number => typeof id === "number");
  } catch {
    return [];
  }
}

export default function MovieDetailPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id || "0", 10);
  const { toast } = useToast();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const addToWatchlist = useAddToWatchlist();
  const { increment, shouldShowAffiliate } = useWatchCount();
  const [affiliateDismissed, setAffiliateDismissed] = useState(() => {
    try {
      return typeof window !== 'undefined' && sessionStorage.getItem('affiliateDismissed') === 'true';
    } catch {
      return false;
    }
  });

  const { data: movie, isLoading } = useGetMovieById(id, {
    query: { enabled: !!id, queryKey: getGetMovieByIdQueryKey(id) },
  });

  const { data: similar } = useGetSimilarMovies(id, {
    query: { enabled: !!id, queryKey: getGetSimilarMoviesQueryKey(id) },
  });

  useEffect(() => {
    if (!movie) return;
    const stored = localStorage.getItem(`reaction_${movie.id}`);
    if (stored) setReaction(stored);
  }, [movie]);

  useEffect(() => {
    if (!movie) return;

    const stored = getStoredWatchlistIds();
    setInWatchlist(stored.includes(movie.id));


    const platforms = movie.ott_platforms ?? (movie.ott_platform && movie.ott_platform !== "unknown" ? [movie.ott_platform] : []);
    const ottName = platforms.length ? (OTT_CONFIG[platforms[0]]?.name ?? platforms[0]) : "OTT";
    const year = movie.release_date?.slice(0, 4) ?? "";
    const pageUrl = window.location.href;
    const imageUrl = movie.backdrop_path
      ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
      : movie.poster_path
        ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
        : "";

    const title = `${movie.title} (${year}) — ${ottName} pe Dekho | FilmDhundo`;
    const description = platforms.length
      ? `${movie.title} ab ${ottName} pe available hai. ${movie.language} mein dekhein. Abhi subscribe karein.`
      : `${movie.title} (${year}) — FilmDhundo pe dekhein kahan available hai. ${movie.language} mein dekhein.`;

    // Use SeoHead component (rendered below) to update head tags and JSON-LD

    // increment watch count when movie loads
    try { increment(); } catch {}

    return () => {
      // nothing special to cleanup here; SeoHead handles head cleanup on unmount
    };
  }, [movie]);

  const handleWatchlist = () => {
    if (!movie) return;
    const stored = getStoredWatchlistIds();
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
  const activePlatforms = movie
    ? (movie.ott_platforms ?? (movie.ott_platform && movie.ott_platform !== "unknown" ? [movie.ott_platform] : []))
    : [];
  const primaryOttName = activePlatforms.length ? (OTT_CONFIG[activePlatforms[0]]?.name ?? activePlatforms[0]) : null;
  const shareText = movie
    ? primaryOttName
      ? `${movie.title} ${primaryOttName} pe available hai! Yahan dekho: ${shareUrl}`
      : `${movie.title} dekhein FilmDhundo pe! Yahan dekho: ${shareUrl}`
    : "";

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
  const safeCast = (movie.cast ?? []).filter((member) => !!member);
  const safeSimilar = (similar ?? []).filter((item) => !!item && typeof item.id === "number");

  const handleReaction = (type: 'liked' | 'disliked') => {
    if (!movie || reaction) return; // cannot change after clicking
    try {
      localStorage.setItem(`reaction_${movie.id}`, type);
      setReaction(type);
    } catch {}
  };

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
    actor: safeCast.map((c) => ({ "@type": "Person", name: c.name })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead title={`${movie.title} (${year}) — ${primaryOttName ?? 'OTT'} pe Dekho | FilmDhundo`} description={movie.overview || ''} image={backdropUrl || posterUrl} url={typeof window !== 'undefined' ? window.location.href : ''} type="video.movie" jsonLd={jsonLd} />
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
              <span className="flex items-center gap-1 text-yellow-500">
                <span className="text-sm font-medium" style={{ color: '#F5C518' }}>IMDb</span>
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-foreground font-medium">{movie.vote_average}</span>/10
              </span>
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

            {/* Trivia section: Kya Aap Jaante The? - below overview, above cast */}
            {(() => {
              const tagline = (movie as any).tagline || null;
              const firstKeyword = (movie as any).keywords?.[0] || null;
              const firstSentence = movie.overview
                ? movie.overview.split(/(?<=[.?!])\s+/)[0]
                : null;
              if (!tagline && !firstKeyword && !firstSentence) return null;
              return (
                <section className="mt-4">
                  <div className="rounded-lg border border-border bg-[#f5f5f5] p-4 my-4">
                    <h3 className="text-base font-semibold text-foreground mb-3">Kya Aap Jaante The?</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                      {tagline && <li>{tagline}</li>}
                      {firstKeyword && <li>{firstKeyword}</li>}
                      {firstSentence && <li>{firstSentence}</li>}
                    </ol>
                  </div>
                </section>
              );
            })()}

            {/* Reaction buttons (below trivia, above cast) */}
            <div className="mt-2 mb-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className={`flex-1 ${reaction === 'liked' ? 'border-[#E24B4A] text-[#E24B4A]' : ''}`}
                  onClick={() => handleReaction('liked')}
                  disabled={!!reaction}
                >
                  👍 Pasand Aaya
                </Button>
                <Button
                  variant="outline"
                  className={`flex-1 ${reaction === 'disliked' ? 'border-[#1a1a1a] text-[#1a1a1a]' : ''}`}
                  onClick={() => handleReaction('disliked')}
                  disabled={!!reaction}
                >
                  👎 Pasand Nahi Aaya
                </Button>
              </div>
              {reaction === 'liked' && <p className="text-sm mt-2" style={{ color: '#E24B4A' }}>Aapne pasand kiya!</p>}
              {reaction === 'disliked' && <p className="text-sm mt-2" style={{ color: '#1a1a1a' }}>Feedback note ho gaya</p>}
            </div>

            <div className="mb-6">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-3">Kahan Dekhein</h2>
              <div className="flex flex-wrap gap-3 items-center">
                {activePlatforms.length > 0 ? (
                  activePlatforms.map((platformKey) => {
                    const cfg = OTT_CONFIG[platformKey];
                    if (!cfg) return null;
                    return (
                      <a
                        key={platformKey}
                        href={cfg.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90"
                        style={{ backgroundColor: cfg.color }}
                        data-testid={`button-ott-${platformKey}`}
                      >
                        {cfg.buttonText}
                      </a>
                    );
                  })
                ) : (
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted-foreground bg-muted">
                    OTT Date Aani Hai
                  </span>
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
              {/* Affiliate banner after watch buttons */}
              {!affiliateDismissed && shouldShowAffiliate && (
                <div
                  className="mt-3"
                  style={{ backgroundColor: "#f5f5f5", border: "1px solid #e0e0e0", borderRadius: 8, padding: "12px 16px", marginTop: 12 }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm" style={{ color: "#666666" }}>Aur dekhna hai? Prime ka 30 din free trial lo</p>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" onClick={() => window.open('https://www.primevideo.com/?tag=freefilm-21', '_blank')}>Free Trial Lo</Button>
                      <button
                        className="text-sm text-muted-foreground"
                        onClick={() => { sessionStorage.setItem('affiliateDismissed', 'true'); setAffiliateDismissed(true); }}
                      >
                        Nahi chahiye
                      </button>
                    </div>
                  </div>
                </div>
              )}
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

        {safeCast.length > 0 && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-foreground mb-3">Cast</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {safeCast.map((member) => (
                <div key={member.id} className="shrink-0 w-20 text-center" data-testid={`card-cast-${member.id}`}>
                  <div className="w-16 h-16 mx-auto rounded-full overflow-hidden bg-muted border border-border mb-1">
                    {member.profile_path ? (
                      <img
                        src={getTmdbImage.profile(member.profile_path)}
                        alt={member.name || "Cast member"}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                        {member.name?.[0] ?? "?"}
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

        {safeSimilar.length > 0 && (
          <div className="mt-8">
            <h2 className="text-base font-semibold text-foreground mb-3">Isse Milti Julti Movies</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {safeSimilar.map((m, i) => (
                <div key={m.id} className="shrink-0 w-32">
                  <MovieCard movie={m} index={i} />
                </div>
              ))}
            </div>
          </div>
        )}

        <FAQSection title={movie.title} ottNames={activePlatforms.map((k) => OTT_CONFIG[k]?.name ?? k)} language={movie.language} />
      </div>
    </div>
  );
}
