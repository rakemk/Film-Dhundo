import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Bookmark, Trash2, Crown } from "lucide-react";
import {
  useGetWatchlist,
  useDeleteWatchlistEntry,
  getGetWatchlistQueryKey,
} from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { OTT_CONFIG, getTmdbImage } from "@/lib/ott";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Star } from "lucide-react";

const FREE_LIMIT = 5;
const USER_ID = "guest";

export default function WatchlistPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPremium] = useState(false);
  const deleteEntry = useDeleteWatchlistEntry();

  const { data: watchlistItems = [], isLoading } = useGetWatchlist(
    { userId: USER_ID },
    { query: { queryKey: getGetWatchlistQueryKey({ userId: USER_ID }) } }
  );

  const handleRemove = (id: number, title: string) => {
    deleteEntry.mutate(
      { id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetWatchlistQueryKey({ userId: USER_ID }) });
          toast({ title: `"${title}" watchlist se hataya` });
        },
        onError: () => {
          toast({ title: "Error", description: "Hatane mein dikkat aayi", variant: "destructive" });
        },
      }
    );
  };

  const atLimit = !isPremium && watchlistItems.length >= FREE_LIMIT;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-primary" />
              Meri Watchlist
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {watchlistItems.length} movies saved
              {!isPremium && ` · ${FREE_LIMIT - watchlistItems.length} jagah bachi`}
            </p>
          </div>
          {!isPremium && (
            <Link href="/premium" data-testid="link-get-premium">
              <Button size="sm" className="gap-2 bg-primary text-primary-foreground">
                <Crown className="w-4 h-4" /> Premium Lo
              </Button>
            </Link>
          )}
        </div>

        {!isPremium && (
          <div className="mb-6 rounded-xl border border-primary/30 bg-primary/5 p-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-foreground">
                Ads hatao, aur features pao — sirf ₹49/mahine
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Unlimited watchlist, no ads, advanced filters aur bahut kuch
              </p>
            </div>
            <Link href="/premium">
              <Button size="sm" className="shrink-0 bg-primary text-primary-foreground" data-testid="button-upsell-premium">
                <Crown className="w-4 h-4 mr-1" /> Upgrade Karein
              </Button>
            </Link>
          </div>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden animate-pulse">
                <div className="aspect-[2/3] bg-muted" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!isLoading && watchlistItems.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Bookmark className="w-14 h-14 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">Watchlist khaali hai</p>
            <p className="text-sm mt-1">Kisi bhi movie pe "Baad Mein Dekho" click karein</p>
            <Link href="/">
              <Button className="mt-4 bg-primary text-primary-foreground" data-testid="button-browse-movies">
                Movies Dhundo
              </Button>
            </Link>
          </div>
        )}

        {!isLoading && watchlistItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {watchlistItems.map((item) => {
              const ott = OTT_CONFIG[item.ott_platform] || { name: item.ott_platform, color: "#666" };
              const posterUrl = getTmdbImage.posterThumb(item.poster_path);
              return (
                <div key={item.id} className="group relative rounded-xl border border-border bg-card overflow-hidden hover:-translate-y-[3px] transition-transform duration-200" data-testid={`card-watchlist-${item.id}`}>
                  <Link href={`/movies/${item.movieId}`}>
                    <div className="relative aspect-[2/3] bg-muted">
                      {posterUrl ? (
                        <img src={posterUrl} alt={item.title} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs px-2 text-center">{item.title}</div>
                      )}
                      <span
                        className="absolute top-2 right-2 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: ott.color }}
                      >
                        {ott.name.split(" ")[0]}
                      </span>
                    </div>
                    <div className="p-3">
                      <p className="text-xs font-medium text-foreground line-clamp-2">{item.title}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">{new Date(item.addedAt).toLocaleDateString("hi-IN")}</p>
                    </div>
                  </Link>
                  <button
                    onClick={() => handleRemove(item.id, item.title)}
                    className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-full p-1.5 hover:bg-red-500"
                    data-testid={`button-remove-${item.id}`}
                    aria-label="Remove from watchlist"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
