import { useState } from "react";
import { Check, Crown, Zap, Shield } from "lucide-react";
import { useCreatePaymentOrder, useVerifyPayment } from "@workspace/api-client-react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}
interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
  modal?: { ondismiss?: () => void };
}
interface RazorpayInstance {
  open: () => void;
}

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "₹0",
    period: "/mahine",
    highlight: false,
    icon: Shield,
    features: [
      "Movies browse karein",
      "OTT platform dhundein",
      "Basic search",
      "5 movies watchlist",
      "Ads dikhenge",
    ],
    cta: "Abhi Istemal Karein",
    disabled: true,
  },
  {
    key: "premium",
    name: "Premium",
    price: "₹49",
    period: "/mahine",
    highlight: true,
    icon: Crown,
    features: [
      "Koi ads nahi",
      "Unlimited watchlist",
      "Advanced filters",
      "Naye release alerts",
      "Regional language filter",
    ],
    cta: "Premium Lo",
    disabled: false,
  },
  {
    key: "annual",
    name: "Annual",
    price: "₹399",
    period: "/saal",
    highlight: false,
    icon: Zap,
    features: [
      "Sab kuch Premium mein",
      "₹189 ki bachat",
      "Priority support",
      "Early access",
      "Naye features pehle",
    ],
    cta: "Annual Lo",
    disabled: false,
  },
];

export default function PremiumPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const createOrder = useCreatePaymentOrder();
  const verifyPayment = useVerifyPayment();

  const handleSubscribe = async (planKey: string) => {
    if (planKey === "free") return;
    setLoading(planKey);

    createOrder.mutate(
      { data: { plan: planKey, userId: "guest" } },
      {
        onSuccess: (order) => {
          const options: RazorpayOptions = {
            key: order.keyId,
            amount: order.amount,
            currency: order.currency,
            name: "FilmDhundo",
            description: planKey === "annual" ? "Annual Premium Plan" : "Monthly Premium Plan",
            order_id: order.orderId,
            handler: (response) => {
              verifyPayment.mutate(
                {
                  data: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    userId: "guest",
                    plan: planKey,
                  },
                },
                {
                  onSuccess: () => {
                    setSuccess(true);
                    setLoading(null);
                  },
                  onError: () => {
                    toast({ title: "Verification failed", description: "Payment verify nahi hua. Support se milein.", variant: "destructive" });
                    setLoading(null);
                  },
                }
              );
            },
            theme: { color: "#E24B4A" },
            modal: { ondismiss: () => setLoading(null) },
          };

          if (typeof window !== "undefined" && window.Razorpay) {
            const rzp = new window.Razorpay(options);
            rzp.open();
          } else {
            toast({ title: "Demo Mode", description: "Razorpay keys add karein real payments ke liye. Abhi demo mein premium activate ho raha hai." });
            verifyPayment.mutate(
              { data: { razorpay_order_id: order.orderId, razorpay_payment_id: "pay_demo", razorpay_signature: "demo_sig", userId: "guest", plan: planKey } },
              { onSuccess: () => { setSuccess(true); setLoading(null); }, onError: () => setLoading(null) }
            );
          }
        },
        onError: () => {
          toast({ title: "Error", description: "Order create nahi hua. Dobara try karein.", variant: "destructive" });
          setLoading(null);
        },
      }
    );
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Crown className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Premium Shuru Ho Gaya!</h1>
          <p className="text-muted-foreground mb-6">Ab aap unlimited movies save kar sakte hain aur bina ads ke movies dhund sakte hain.</p>
          <a href="/" className="inline-block">
            <Button className="bg-primary text-primary-foreground" data-testid="button-go-home">
              Movies Dhundo
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-screen-lg mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <Crown className="w-10 h-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-foreground mb-2">FilmDhundo Premium</h1>
          <p className="text-muted-foreground">Ads hatao, unlimited watchlist pao, aur bahut kuch</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.key}
                className={`relative rounded-2xl border-2 p-6 flex flex-col ${
                  plan.highlight
                    ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                    : "border-border bg-card"
                }`}
                data-testid={`card-plan-${plan.key}`}
              >
                {plan.highlight && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    SABSE POPULAR
                  </span>
                )}
                <div className="flex items-center gap-2 mb-4">
                  <Icon className={`w-5 h-5 ${plan.highlight ? "text-primary" : "text-muted-foreground"}`} />
                  <h2 className="font-bold text-foreground">{plan.name}</h2>
                </div>
                <div className="mb-6">
                  <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <ul className="space-y-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={() => handleSubscribe(plan.key)}
                  disabled={plan.disabled || loading === plan.key}
                  className={`w-full ${plan.highlight ? "bg-primary text-primary-foreground hover:bg-primary/90" : "variant-outline"}`}
                  variant={plan.highlight ? "default" : "outline"}
                  data-testid={`button-subscribe-${plan.key}`}
                >
                  {loading === plan.key ? "Processing..." : plan.cta}
                </Button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Secure payment by Razorpay · Kabhi bhi cancel karein
        </p>
      </div>
    </div>
  );
}
