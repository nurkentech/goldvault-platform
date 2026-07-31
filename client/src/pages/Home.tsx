/**
 * Home.tsx — GoldVaults.us Main Page
 * Full-page scrollable landing + platform dashboard tabs
 * Dark navy & gold color scheme
 */
import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";
import {
  Wallet, ArrowUpRight, Bitcoin, Coins, DollarSign,
  Pickaxe, MessageCircle, Gamepad2, Flame, CreditCard,
  TrendingUp, ArrowRight
} from "lucide-react";

// Notification system
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationBell from "@/components/NotificationBell";

// Existing platform components
import AILiveRepresentative from "@/components/AILiveRepresentative";
import FinancialDashboard from "@/components/FinancialDashboard";
import PlatformFeatures from "@/components/PlatformFeatures";
import GoldMiningPartners from "@/components/GoldMiningPartners";
import WalletDashboard from "@/components/WalletDashboard";
import ExchangeWithdrawal from "@/components/ExchangeWithdrawal";
import SocialHub from "@/components/SocialHub";
import GameChallenges from "@/components/GameChallenges";
import GoldMinting from "@/components/GoldMinting";
import BitcoinSend from "@/components/BitcoinSend";
import GoldCoinsTransfer from "@/components/GoldCoinsTransfer";
import NFCDebitCard from "@/components/NFCDebitCard";
import PaymentIntegration from "@/components/PaymentIntegration";
import SignUpModal from "@/components/SignUpModal";

// New premium homepage sections
import PremiumNav from "@/components/PremiumNav";
import HeroSlider from "@/components/HeroSlider";
import DualTicker from "@/components/DualTicker";
import CryptoCards from "@/components/CryptoCards";
import { TradingViewChart, CryptoConverter, FeaturedServices, WhyGoldVaults } from "@/components/TradingSection";
import { MarketMovers, NewsSection, PriceHeatmap, TradingFeatures, SecuritySection } from "@/components/MarketSections";
import { Testimonials, MobileApp, Newsletter, Footer } from "@/components/BottomSections";

// ─── Tab card wrapper ─────────────────────────────────────────────────────────
function TabCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
      {children}
    </div>
  );
}

// ─── Platform Dashboard (embedded tab section) ────────────────────────────────
function PlatformDashboard({ onSignIn, onGetStarted }: { onSignIn: () => void; onGetStarted: () => void }) {
  const [activeTab, setActiveTab] = useState("overview");
  const handleNavigate = useCallback((tab: string) => setActiveTab(tab), []);

  const navTabs = [
    { id: "overview", label: "Platform", icon: <TrendingUp className="w-3 h-3" /> },
    { id: "wallet", label: "Wallet", icon: <Wallet className="w-3 h-3" /> },
    { id: "exchange", label: "Exchange", icon: <ArrowUpRight className="w-3 h-3" /> },
    { id: "send-btc", label: "Send BTC", icon: <Bitcoin className="w-3 h-3" /> },
    { id: "send-coins", label: "Send Coins", icon: <Coins className="w-3 h-3" /> },
    { id: "financials", label: "Financials", icon: <DollarSign className="w-3 h-3" /> },
    { id: "mining", label: "Mining", icon: <Pickaxe className="w-3 h-3" /> },
    { id: "social", label: "Social", icon: <MessageCircle className="w-3 h-3" /> },
    { id: "challenges", label: "Challenges", icon: <Gamepad2 className="w-3 h-3" /> },
    { id: "minting", label: "Mint Gold", icon: <Flame className="w-3 h-3" /> },
    { id: "nfc-card", label: "Debit Card", icon: <CreditCard className="w-3 h-3" /> },
  ];

  const toolActions: Record<string, { label: string; href: string; description: string }> = {
    overview: { label: "Open account dashboard", href: "/dashboard", description: "Access the live tools and account data available to your profile." },
    wallet: { label: "Open live wallets", href: "/dashboard/wallets", description: "View persisted balances, addresses, and wallet actions." },
    exchange: { label: "Open live exchange", href: "/dashboard/exchange", description: "Use the authenticated exchange with your account wallets." },
    "send-btc": { label: "Send from your account", href: "/dashboard/withdraw", description: "Open the secure withdrawal flow with balance and 2FA checks." },
    "send-coins": { label: "Open wallet transfers", href: "/dashboard/wallets", description: "Manage GoldCoins and account wallet transfers." },
    financials: { label: "View account financials", href: "/dashboard", description: "Review your real portfolio totals, transactions, and investments." },
    mining: { label: "Open mining explorer", href: "/mining-partners", description: "Research mining companies and review available account investments." },
    social: { label: "Open Social Hub", href: "/social", description: "Read real community posts or sign in to publish and earn rewards." },
    challenges: { label: "Open account rewards", href: "/dashboard/rewards", description: "Track eligible challenges and claim completed rewards." },
    minting: { label: "Open gold minting", href: "/mint", description: "Review minting requirements and your authenticated minting history." },
    "nfc-card": { label: "Manage account cards", href: "/dashboard/cards", description: "Request and control eligible virtual or physical cards." },
  };
  const activeTool = toolActions[activeTab];

  return (
    <section id="platform" className="bg-slate-900 py-16">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
        {/* Section header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-wider mb-1">Your Dashboard</p>
            <h2 className="text-3xl font-black text-white">Platform Tools</h2>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell onNavigate={handleNavigate} />
            <button
              onClick={onSignIn}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-all"
            >
              Sign In
            </button>
            <button
              onClick={onGetStarted}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all active:scale-[0.97]"
            >
              Get Started
            </button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tab navigation */}
          <div className="overflow-x-auto pb-2 mb-6">
            <TabsList className="flex gap-1 bg-slate-800/60 border border-white/8 rounded-xl p-1 w-max min-w-full h-auto">
              {navTabs.map(tab => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all data-[state=active]:bg-amber-500 data-[state=active]:text-slate-900 text-slate-400 hover:text-white"
                >
                  {tab.icon}
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {activeTool && (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-white">Live tool available</p>
                <p className="text-xs text-slate-300">{activeTool.description}</p>
              </div>
              <Link href={activeTool.href} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-emerald-400">
                {activeTool.label} <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}

          {/* Tab contents */}
          <TabsContent value="overview" className="space-y-8">
            <PlatformFeatures />
            <PaymentIntegration />
          </TabsContent>
          <TabsContent value="wallet"><TabCard><WalletDashboard /></TabCard></TabsContent>
          <TabsContent value="exchange"><TabCard><ExchangeWithdrawal /></TabCard></TabsContent>
          <TabsContent value="send-btc">
            <div className="max-w-2xl mx-auto"><TabCard><BitcoinSend /></TabCard></div>
          </TabsContent>
          <TabsContent value="send-coins">
            <div className="max-w-2xl mx-auto"><TabCard><GoldCoinsTransfer /></TabCard></div>
          </TabsContent>
          <TabsContent value="financials" className="space-y-12"><FinancialDashboard /></TabsContent>
          <TabsContent value="mining" className="space-y-8"><GoldMiningPartners /></TabsContent>
          <TabsContent value="social" className="space-y-8"><SocialHub /></TabsContent>
          <TabsContent value="challenges" className="space-y-8"><GameChallenges /></TabsContent>
          <TabsContent value="minting" className="space-y-8"><GoldMinting /></TabsContent>
          <TabsContent value="nfc-card" className="space-y-8"><NFCDebitCard /></TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

// ─── Global helper so any component can open the sign-up modal ───────────────
export function openSignUpModal(mode: "signup" | "login" = "signup") {
  window.dispatchEvent(new CustomEvent("goldvaults:open-signup", { detail: { mode } }));
}

// ─── Full homepage ────────────────────────────────────────────────────────────
function HomeContent() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpMode, setSignUpMode] = useState<"signup" | "login">("signup");
  const [authSuccessPath, setAuthSuccessPath] = useState("/dashboard");

  const handleGetStarted = useCallback(() => {
    setSignUpMode("signup");
    setShowSignUp(true);
  }, []);

  const handleSignIn = useCallback(() => {
    setSignUpMode("login");
    setShowSignUp(true);
  }, []);

  // Listen for global open-signup events dispatched by child components
  useEffect(() => {
    const handler = (e: Event) => {
      const mode = (e as CustomEvent).detail?.mode ?? "signup";
      setSignUpMode(mode);
      setShowSignUp(true);
    };
    window.addEventListener("goldvaults:open-signup", handler);
    return () => window.removeEventListener("goldvaults:open-signup", handler);
  }, []);

  // Open built-in authentication when protected routes redirect here because
  // an external OAuth portal is not configured for this installation.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("auth") !== "login") return;

    const requestedPath = params.get("returnPath");
    if (requestedPath?.startsWith("/") && !requestedPath.startsWith("//")) {
      setAuthSuccessPath(requestedPath);
    }
    setSignUpMode("login");
    setShowSignUp(true);

    params.delete("auth");
    params.delete("returnPath");
    const query = params.toString();
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}${window.location.hash}`
    );
  }, []);

  return (
    <div className="min-h-screen bg-slate-900">
      {/* 1. Sticky premium nav */}
      <PremiumNav onRegisterClick={handleGetStarted} onLoginClick={handleSignIn} />

      {/* 2. Hero Slider */}
      <HeroSlider onGetStarted={handleGetStarted} />

      {/* 3. Dual live tickers */}
      <DualTicker />

      {/* 4. Crypto cards with mini charts */}
      <CryptoCards />

      {/* 5. TradingView live chart */}
      <TradingViewChart />

      {/* 6. Crypto converter */}
      <CryptoConverter />

      {/* 7. Featured services grid */}
      <FeaturedServices />

      {/* 8. Why GoldVaults stats */}
      <WhyGoldVaults />

      {/* 9. Market movers tabs */}
      <MarketMovers />

      {/* 10. Crypto news */}
      <NewsSection />

      {/* 11. Price heatmap */}
      <PriceHeatmap />

      {/* 12. Trading features */}
      <TradingFeatures />

      {/* 13. Security section */}
      <SecuritySection />

      {/* 14. Platform dashboard (all existing features) */}
      <PlatformDashboard onSignIn={handleSignIn} onGetStarted={handleGetStarted} />

      {/* 15. Testimonials */}
      <Testimonials />

      {/* 16. Mobile app */}
      <MobileApp />

      {/* 17. Newsletter */}
      <Newsletter />

      {/* 18. Footer — includes the FAQ link */}
      <Footer />

      {/* Floating AI support */}
      <AILiveRepresentative />

      {/* Sign Up / Sign In Modal */}
      {showSignUp && (
        <SignUpModal
          isOpen={showSignUp}
          onClose={() => setShowSignUp(false)}
          initialMode={signUpMode}
          successPath={authSuccessPath}
        />
      )}
    </div>
  );
}

// ─── Root export with providers ───────────────────────────────────────────────
export default function Home() {
  return (
    <NotificationProvider>
      <HomeContent />
    </NotificationProvider>
  );
}
