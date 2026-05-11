import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Bookmark, Crown, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavbarProps {
  onSearchClick?: () => void;
}

export function Navbar({ onSearchClick }: NavbarProps) {
  const [, setLocation] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-1 shrink-0" data-testid="link-home">
          <span className="text-xl font-bold text-primary">Film</span>
          <span className="text-xl font-bold text-foreground">Dhundo</span>
        </Link>

        <button
          className="flex-1 max-w-md hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground text-sm hover:border-primary/50 transition-colors cursor-pointer"
          onClick={() => { setLocation("/search"); onSearchClick?.(); }}
          data-testid="button-search-bar"
        >
          <Search className="w-4 h-4 shrink-0" />
          <span>Movie ya series dhundo...</span>
        </button>

        <nav className="hidden sm:flex items-center gap-2">
          <Link href="/watchlist" data-testid="link-watchlist">
            <Button variant="ghost" size="icon" className="relative" aria-label="Watchlist">
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

        <button className="sm:hidden" onClick={() => setMenuOpen(!menuOpen)} data-testid="button-menu-toggle" aria-label="Menu">
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-3 flex flex-col gap-3">
          <button
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-muted text-muted-foreground text-sm"
            onClick={() => { setLocation("/search"); setMenuOpen(false); }}
            data-testid="button-search-mobile"
          >
            <Search className="w-4 h-4" />
            Movie ya series dhundo...
          </button>
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
        </div>
      )}
    </header>
  );
}
