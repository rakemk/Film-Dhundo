import { Navbar } from "@/components/Navbar";
import { Tv, Search, Bookmark, Shield } from "lucide-react";

const FEATURES = [
  {
    icon: Search,
    title: "Ek jagah, sab OTT",
    desc: "Netflix, Prime Video, Hotstar, ZEE5, SonyLIV aur MX Player — sabka data ek hi jagah milega.",
  },
  {
    icon: Tv,
    title: "Real-time availability",
    desc: "TMDB ke Watch Providers API se real OTT data milta hai. Jo dikhta hai, woh actually available hai.",
  },
  {
    icon: Bookmark,
    title: "Watchlist",
    desc: "Jo movies baad mein dekhni hain unhe save karo. Free mein 5 movies, Premium mein unlimited.",
  },
  {
    icon: Shield,
    title: "No account required",
    desc: "Koi sign-up nahi, koi email nahi. Seedha kaam karo.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="mb-10">
          <h1 className="text-2xl font-bold text-foreground mb-3">
            <span className="text-primary">Film</span>Dhundo ke baare mein
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            FilmDhundo India ka OTT guide hai — ek simple tool jo batata hai ki koi bhi movie ya web series
            India mein kis OTT platform pe available hai.
          </p>
        </div>

        <div className="mb-10">
          <h2 className="text-base font-semibold text-foreground mb-3">Kyun banaya?</h2>
          <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Humne notice kiya ki log WhatsApp groups aur dosto se poochte rehte hain — "yaar, <em>yeh movie</em> kahan dekhein?"
              Kabhi Prime pe hai, kabhi Hotstar pe shift ho jaati hai, kabhi toh kisi pe nahi hoti.
            </p>
            <p>
              6 alag apps open karke dhundhna time waste hai. FilmDhundo woh sab ek hi jagah
              kar deta hai — real data ke saath, bina kisi account ke.
            </p>
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-base font-semibold text-foreground mb-4">Kya kya milta hai</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4 text-primary" />
                  <h3 className="text-sm font-semibold text-foreground">{title}</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mb-10">
          <h2 className="text-base font-semibold text-foreground mb-3">Data kahan se aata hai?</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            FilmDhundo{" "}
            <a href="https://www.themoviedb.org" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              TMDB (The Movie Database)
            </a>{" "}
            ka use karta hai — jo duniya ka sabse bada open movie database hai. OTT availability TMDB ke
            Watch Providers API se aati hai jo region India (IN) ke liye filtered hoti hai.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            Hum kisi bhi OTT company se affiliated nahi hain. Platform buttons pe jo affiliate links hain,
            unse hume thodi si commission milti hai — site ko free rakhne ke liye.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 text-center">
          <p className="text-sm text-muted-foreground">Koi suggestion hai ya kuch missing hai?</p>
          <a
            href="/contact"
            className="inline-block mt-2 text-sm text-primary font-medium hover:underline"
          >
            Humse baat karein →
          </a>
        </div>
      </div>

      <footer className="mt-12 border-t border-border py-6 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-6">
          <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="/about" className="text-primary">About</a>
          <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        <p className="mt-3 text-xs">© 2025 FilmDhundo — India ka OTT Guide</p>
      </footer>
    </div>
  );
}
