/**
 * Home.tsx — GoldVaults.us Main Page
 * Full-page scrollable landing + platform dashboard tabs
 * Dark navy & gold color scheme
 */
import { useState, useCallback, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet, ArrowUpRight, Bitcoin, Coins, DollarSign,
  Shield, Pickaxe, MessageCircle, Gamepad2, Flame, CreditCard,
  TrendingUp, BarChart3, ArrowRight
} from "lucide-react";

// Notification system
import { NotificationProvider } from "@/contexts/NotificationContext";
import NotificationBell from "@/components/NotificationBell";

// Existing platform components
import AILiveRepresentative from "@/components/AILiveRepresentative";
import FinancialDashboard from "@/components/FinancialDashboard";
import PlatformFeatures from "@/components/PlatformFeatures";
import TechnicalArchitecture from "@/components/TechnicalArchitecture";
import TrustCredibility from "@/components/TrustCredibility";
import FAQ from "@/components/FAQ";
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
import { Testimonials, MobileApp, FAQSection, Newsletter, Footer } from "@/components/BottomSections";

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
    { id: "trust", label: "Trust", icon: <Shield className="w-3 h-3" /> },
    { id: "faq-platform", label: "FAQ", icon: null },
    { id: "mining", label: "Mining", icon: <Pickaxe className="w-3 h-3" /> },
    { id: "social", label: "Social", icon: <MessageCircle className="w-3 h-3" /> },
    { id: "challenges", label: "Challenges", icon: <Gamepad2 className="w-3 h-3" /> },
    { id: "minting", label: "Mint Gold", icon: <Flame className="w-3 h-3" /> },
    { id: "nfc-card", label: "Debit Card", icon: <CreditCard className="w-3 h-3" /> },
    { id: "architecture", label: "Architecture", icon: <BarChart3 className="w-3 h-3" /> },
  ];

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
          <TabsContent value="trust" className="space-y-8"><TrustCredibility /></TabsContent>
          <TabsContent value="faq-platform" className="space-y-8"><FAQ /></TabsContent>
          <TabsContent value="mining" className="space-y-8"><GoldMiningPartners /></TabsContent>
          <TabsContent value="social" className="space-y-8"><SocialHub /></TabsContent>
          <TabsContent value="challenges" className="space-y-8"><GameChallenges /></TabsContent>
          <TabsContent value="minting" className="space-y-8"><GoldMinting /></TabsContent>
          <TabsContent value="nfc-card" className="space-y-8"><NFCDebitCard /></TabsContent>
          <TabsContent value="architecture" className="space-y-12"><TechnicalArchitecture /></TabsContent>
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
  const [authSuccessPath, setAuthSuccessPath] = useState("/profile");

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

      {/* 17. FAQ */}
      <FAQSection />

      {/* 18. Newsletter */}
      <Newsletter />

      {/* 19. Footer */}
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
