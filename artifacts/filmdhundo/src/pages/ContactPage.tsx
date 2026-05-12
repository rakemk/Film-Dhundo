import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Mail, MessageSquare, Bug, Lightbulb } from "lucide-react";

const REASONS = [
  { icon: Bug, label: "Bug report" },
  { icon: Lightbulb, label: "Suggestion" },
  { icon: MessageSquare, label: "General" },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [reason, setReason] = useState("General");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const subject = encodeURIComponent(`[FilmDhundo - ${reason}] ${name ? `from ${name}` : ""}`);
    const body = encodeURIComponent(message);
    window.location.href = `mailto:hello@filmdhundo.in?subject=${subject}&body=${body}`;
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-12">
        <h1 className="text-2xl font-bold text-foreground mb-2">Contact</h1>
        <p className="text-sm text-muted-foreground mb-8">
          Koi sawaal, suggestion ya bug? Hum sunna chahte hain.
        </p>

        <div className="rounded-xl border border-border bg-card p-5 mb-6 flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Direct email</p>
            <a
              href="mailto:hello@filmdhundo.in"
              className="text-sm font-medium text-primary hover:underline"
            >
              hello@filmdhundo.in
            </a>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-xl border border-border bg-card p-8 text-center">
            <MessageSquare className="w-10 h-10 text-primary mx-auto mb-3 opacity-80" />
            <p className="font-semibold text-foreground">Shukriya!</p>
            <p className="text-sm text-muted-foreground mt-1">
              Aapka email client khul gaya hoga. Agar nahi khula toh directly{" "}
              <a href="mailto:hello@filmdhundo.in" className="text-primary hover:underline">
                hello@filmdhundo.in
              </a>{" "}
              pe mail karein.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-xs text-muted-foreground hover:text-foreground underline"
            >
              Dobara likhein
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Aapka naam <span className="text-muted-foreground font-normal">(optional)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Naam likhein..."
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Vishay
              </label>
              <div className="flex gap-2">
                {REASONS.map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setReason(label)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      reason === label
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary/50"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Message <span className="text-red-500">*</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                placeholder="Aapka sawaal ya suggestion likhein..."
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-colors resize-none"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!message.trim()}
            >
              <Mail className="w-4 h-4 mr-2" />
              Email bhejein
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Form submit karne pe aapka email client khulega.
            </p>
          </form>
        )}
      </div>

      <footer className="mt-12 border-t border-border py-6 text-center text-sm text-muted-foreground">
        <div className="flex justify-center gap-6">
          <a href="/privacy-policy" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="/about" className="hover:text-foreground transition-colors">About</a>
          <a href="/contact" className="text-primary">Contact</a>
        </div>
        <p className="mt-3 text-xs">© 2025 FilmDhundo — India ka OTT Guide</p>
      </footer>
    </div>
  );
}
