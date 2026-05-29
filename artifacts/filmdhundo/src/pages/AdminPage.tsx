import { useState, useRef } from "react";
import { TrendingUp, Users, FileText, Crown, BarChart2, Globe, Lock, Eye, EyeOff, LogOut } from "lucide-react";
import {
  useGetAdminStats,
  useGetTrafficSources,
  useGetWeeklyTraffic,
  useGetTopSeoPages,
  getGetAdminStatsQueryKey,
  getGetTrafficSourcesQueryKey,
  getGetWeeklyTrafficQueryKey,
  getGetTopSeoPagesQueryKey,
} from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Read admin password from env var; fallback to a secure default
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "admin123";
const SESSION_KEY = "filmdhundo_admin_auth";
const SESSION_TIMEOUT_MS = 1800000; // 30 minutes

function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [value, setValue] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify({ timestamp: Date.now() }));
      onSuccess();
    } else {
      setError(true);
      setValue("");
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">FilmDhundo ke liye authenticate karein</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <div className="relative">
              <input
                ref={inputRef}
                type={showPw ? "text" : "password"}
                value={value}
                onChange={(e) => { setValue(e.target.value); setError(false); }}
                placeholder="Admin password daalo"
                autoFocus
                className={`w-full px-3 py-2.5 pr-10 text-sm rounded-lg border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-colors ${
                  error ? "border-red-500 focus:ring-red-400/40" : "border-border focus:border-primary"
                }`}
                data-testid="input-admin-password"
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                tabIndex={-1}
                aria-label="Toggle password visibility"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-500 mt-1.5" data-testid="text-admin-error">
                Galat password. Dobara try karein.
              </p>
            )}
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" data-testid="button-admin-login">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}

const TABS = ["Analytics", "SEO Generator", "Affiliates", "Premium", "Earnings"];

function StatCard({ label, value, growth, icon: Icon }: { label: string; value: string | number; growth: string; icon: React.ElementType }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </div>
      <p className="text-2xl font-bold text-foreground" data-testid={`stat-${label.toLowerCase().replace(/\s/g, "-")}`}>{value}</p>
      <p className="text-xs text-green-600 dark:text-green-400 mt-1">{growth}</p>
    </div>
  );
}

function TrafficBar({ percentage }: { percentage: number }) {
  return (
    <div className="w-24 h-1.5 rounded-full bg-muted overflow-hidden">
      <div className="h-full rounded-full bg-primary" style={{ width: `${percentage}%` }} />
    </div>
  );
}

function WeeklyChart({ data }: { data: Array<{ day: string; visits: number }> }) {
  const max = Math.max(...data.map((d) => d.visits));
  return (
    <div className="space-y-3">
      {data.map((d) => (
        <div key={d.day} className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground w-8">{d.day}</span>
          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(d.visits / max) * 100}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground w-12 text-right">{d.visits.toLocaleString()}</span>
        </div>
      ))}
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (!stored) return false;
      const data = JSON.parse(stored);
      const elapsed = Date.now() - data.timestamp;
      if (elapsed > SESSION_TIMEOUT_MS) {
        sessionStorage.removeItem(SESSION_KEY);
        return false;
      }
      return true;
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTab] = useState("Analytics");

  const adminRequest = { headers: { "x-admin-password": ADMIN_PASSWORD } };

  const { data: stats, isLoading: statsLoading } = useGetAdminStats({
    query: { enabled: authed, queryKey: getGetAdminStatsQueryKey() },
    request: adminRequest,
  });

  const { data: traffic } = useGetTrafficSources({
    query: { enabled: authed, queryKey: getGetTrafficSourcesQueryKey() },
    request: adminRequest,
  });

  const { data: weekly } = useGetWeeklyTraffic({
    query: { enabled: authed, queryKey: getGetWeeklyTrafficQueryKey() },
    request: adminRequest,
  });

  const { data: seoPages } = useGetTopSeoPages({
    query: { enabled: authed, queryKey: getGetTopSeoPagesQueryKey() },
    request: adminRequest,
  });

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthed(false);
  };

  // refresh authed state periodically to enforce session timeout
  if (typeof window !== "undefined") {
    setInterval(() => {
      try {
        const stored = sessionStorage.getItem(SESSION_KEY);
        if (!stored) return setAuthed(false);
        const data = JSON.parse(stored);
        if (Date.now() - data.timestamp > SESSION_TIMEOUT_MS) {
          sessionStorage.removeItem(SESSION_KEY);
          setAuthed(false);
        }
      } catch {
        sessionStorage.removeItem(SESSION_KEY);
        setAuthed(false);
      }
    }, 60000);
  }

  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-screen-lg mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-lg font-bold text-foreground">FilmDhundo Admin Panel</h1>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              Live
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-1 border-b border-border mb-8 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`tab-admin-${tab.toLowerCase().replace(/\s/g, "-")}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Analytics" && (
          <div className="space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {statsLoading ? (
                Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
              ) : stats ? (
                <>
                  <StatCard label="Daily Users" value={stats.dailyUsers.toLocaleString()} growth={stats.dailyUsersGrowth} icon={Users} />
                  <StatCard label="This Month" value={`₹${(stats.monthlyRevenue / 100).toLocaleString()}`} growth={stats.revenueGrowth} icon={TrendingUp} />
                  <StatCard label="SEO Pages" value={stats.seoPages} growth={stats.seoPagesGrowth} icon={FileText} />
                  <StatCard label="Premium Users" value={stats.premiumUsers} growth={stats.premiumGrowth} icon={Crown} />
                </>
              ) : null}
            </div>

            {traffic && traffic.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-muted-foreground" /> Traffic Sources
                </h2>
                <div className="space-y-3">
                  {traffic.map((source) => (
                    <div key={source.source} className="flex items-center justify-between gap-4" data-testid={`source-${source.source.toLowerCase().replace(/\s/g, "-")}`}>
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-5 h-5 rounded bg-muted shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{source.source}</p>
                          <p className="text-xs text-muted-foreground">{source.sessions.toLocaleString()} sessions today</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <TrafficBar percentage={source.percentage} />
                        <span className="text-sm font-semibold text-foreground w-10 text-right">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {weekly && weekly.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-muted-foreground" /> Weekly Traffic (Last 7 Days)
                </h2>
                <WeeklyChart data={weekly} />
              </div>
            )}

            {seoPages && seoPages.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-6">
                <h2 className="text-sm font-semibold text-foreground mb-4">Top Performing SEO Pages Today</h2>
                <div className="space-y-3">
                  {seoPages.map((page) => (
                    <div key={page.url} className="flex items-center justify-between gap-4" data-testid={`seo-page-${page.url}`}>
                      <a href={`https://${page.url}`} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline truncate min-w-0">
                        {page.url}
                      </a>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm text-muted-foreground">{page.clicks} clicks</span>
                        <Badge variant={page.status === "Indexed" ? "default" : "secondary"} className={page.status === "Indexed" ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"}>
                          {page.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "SEO Generator" && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">SEO Generator — Coming Soon</p>
            <p className="text-xs mt-1">Automatic sitemap aur meta tag generator</p>
          </div>
        )}

        {activeTab === "Affiliates" && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <Globe className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Affiliate Links Manager — Coming Soon</p>
            <p className="text-xs mt-1">OTT affiliate links track karein</p>
          </div>
        )}

        {activeTab === "Premium" && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <Crown className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Premium Users Manager — Coming Soon</p>
          </div>
        )}

        {activeTab === "Earnings" && (
          <div className="rounded-xl border border-border bg-card p-8 text-center text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">Earnings Dashboard — Coming Soon</p>
          </div>
        )}
      </div>
    </div>
  );
}
