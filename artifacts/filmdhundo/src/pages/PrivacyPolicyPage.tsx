import { Navbar } from "@/components/Navbar";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: May 2025</p>

        <div className="prose prose-sm max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">1. Information We Collect</h2>
            <p>
              FilmDhundo does not require account registration. We collect minimal data to provide our service:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Pages you visit and movies you search for (via anonymised analytics)</li>
              <li>Movies you add to your Watchlist (stored locally in your browser)</li>
              <li>Your approximate region for OTT availability lookups (we use TMDB's API with region=IN)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">2. Cookies & Local Storage</h2>
            <p>
              We use browser <strong>localStorage</strong> and <strong>sessionStorage</strong> to save your Watchlist and session preferences. No tracking cookies are set by FilmDhundo directly.
            </p>
            <p className="mt-2">
              Third-party services embedded on this site (such as Google AdSense and TMDB image CDN) may set their own cookies. Please refer to their respective privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">3. Third-Party Services</h2>
            <p>FilmDhundo uses the following third-party services:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>TMDB (The Movie Database)</strong> — movie data, posters, and OTT provider information</li>
              <li><strong>Google AdSense</strong> — advertising; Google may use cookies to show relevant ads</li>
              <li><strong>Razorpay</strong> — payment processing for Premium subscriptions</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">4. Affiliate Links</h2>
            <p>
              Some OTT platform links on FilmDhundo are affiliate links. If you subscribe via these links, we may earn a small commission at no extra cost to you. This helps us keep the site free.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">5. Data Sharing</h2>
            <p>
              We do not sell, rent, or share your personal information with any third parties for marketing purposes. Anonymised, aggregated usage data may be used to improve the service.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">6. Children's Privacy</h2>
            <p>
              FilmDhundo is not directed at children under 13. We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">7. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date. Continued use of FilmDhundo after changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-foreground mb-2">8. Contact Us</h2>
            <p>
              If you have questions about this Privacy Policy, please reach us at{" "}
              <a href="/contact" className="text-primary hover:underline">our contact page</a>.
            </p>
          </section>
        </div>
      </div>

      <footer className="mt-12 border-t border-border py-6 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-6">
          <a href="/privacy-policy" className="text-primary">Privacy Policy</a>
          <a href="/about" className="hover:text-foreground transition-colors">About</a>
          <a href="/contact" className="hover:text-foreground transition-colors">Contact</a>
        </div>
        <p className="mt-3 text-xs">© 2025 FilmDhundo — India ka OTT Guide</p>
      </footer>
    </div>
  );
}
