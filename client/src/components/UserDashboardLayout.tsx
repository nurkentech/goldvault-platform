/**
 * UserDashboardLayout — Premium fintech dashboard shell
 * Sidebar navigation + top header with crypto ticker + main content area
 */
import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import {
  LayoutDashboard, Wallet, ArrowDownToLine, ArrowUpFromLine,
  ArrowLeftRight, TrendingUp, Bitcoin, Coins, Receipt,
  Users, Gift, CreditCard, HeadphonesIcon, Bell, Shield,
  Settings, LogOut, Search, Moon, Sun, Globe, Menu, X,
  ChevronDown, MessageSquare, Store, Landmark, Code2, Bot
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { motion, AnimatePresence } from "framer-motion";
import AIAssistantWidget from "@/components/AIAssistantWidget";
import ErrorBoundary from "@/components/ErrorBoundary";
import NotificationDropdown from "@/components/NotificationDropdown";
import { useTheme } from "@/contexts/ThemeContext";
import { Language, useI18n } from "@/contexts/I18nContext";

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Wallets", icon: Wallet, path: "/dashboard/wallets" },
  { label: "Deposit", icon: ArrowDownToLine, path: "/dashboard/deposit" },
  { label: "Withdraw", icon: ArrowUpFromLine, path: "/dashboard/withdraw" },
  { label: "Exchange", icon: ArrowLeftRight, path: "/dashboard/exchange" },
  { label: "Investments", icon: TrendingUp, path: "/dashboard/investments" },
  { label: "AI Copilot", icon: Bot, path: "/dashboard/copilot" },
  { label: "Marketplace", icon: Store, path: "/dashboard/p2p" },
  { label: "Wealth Hub", icon: Landmark, path: "/dashboard/wealth" },
  { label: "Crypto Market", icon: Bitcoin, path: "/markets" },
  { label: "Gold Market", icon: Coins, path: "/trade?pair=XAU" },
  { label: "Transactions", icon: Receipt, path: "/dashboard/transactions" },
  { label: "Referral", icon: Users, path: "/dashboard/referral" },
  { label: "Rewards", icon: Gift, path: "/dashboard/rewards" },
  { label: "Cards", icon: CreditCard, path: "/dashboard/cards" },
  { label: "Support", icon: HeadphonesIcon, path: "/dashboard/support" },
  { label: "Developer & Partner", icon: Code2, path: "/dashboard/developer" },
  { label: "Notifications", icon: Bell, path: "/dashboard/notifications" },
  { label: "Security", icon: Shield, path: "/dashboard/security" },
  { label: "Settings", icon: Settings, path: "/dashboard/settings" },
];

const tickerPairs = [
  { symbol: "BTC/USDT", price: "$67,320.50", change: "+2.35%", positive: true },
  { symbol: "ETH/USDT", price: "$3,452.18", change: "+1.25%", positive: true },
  { symbol: "GOLD", price: "$2,393.58", change: "+0.65%", positive: true },
  { symbol: "USD/NGN", price: "₦1,585.50", change: "-0.20%", positive: false },
  { symbol: "SOL/USDT", price: "$165.35", change: "+3.25%", positive: true },
  { symbol: "BNB/USDT", price: "$602.35", change: "-0.45%", positive: false },
];

export default function UserDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useI18n();
  const { data: livePrices = [] } = trpc.market.prices.useQuery(undefined, { refetchInterval: 30_000 });
  const [location, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      window.location.href = getLoginUrl("/dashboard");
    }
  }, [loading, user]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Loading state
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!user) {
    return <DashboardSkeleton />;
  }

  const currentPath = location;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <a href="#dashboard-content" className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:left-4 focus:top-4 focus:bg-amber-500 focus:text-black focus:px-4 focus:py-2 focus:rounded-lg">Skip to main content</a>
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          bg-[oklch(0.12_0.02_255)] border-r border-white/5
          transition-all duration-300 ease-out
          w-[min(20rem,85vw)]
          ${sidebarOpen ? "lg:w-64" : "lg:w-20"}
          lg:relative
          ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 h-16 border-b border-white/5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
            GV
          </div>
          {(sidebarOpen || mobileMenuOpen) && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
              <h1 className="text-base font-bold text-foreground leading-tight">GOLDVAULT</h1>
              <p className="text-[10px] text-muted-foreground tracking-wider">Global Financial Freedom</p>
            </motion.div>
          )}
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
            className="ml-auto flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-thin">
          {navItems.map((item) => {
            const isActive = currentPath === item.path || (item.path !== "/dashboard" && currentPath.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                 <div
                  onClick={() => setMobileMenuOpen(false)}
                   className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                    transition-all duration-200 cursor-pointer group relative
                    ${isActive
                      ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-amber-500" : ""}`} />
                  {(sidebarOpen || mobileMenuOpen) && (
                    <span className="truncate">{t(item.label)}</span>
                  )}
                  {item.badge && (sidebarOpen || mobileMenuOpen) && (
                    <span className="ml-auto bg-amber-500 text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                  {!sidebarOpen && !mobileMenuOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {t(item.label)}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}

          {/* Logout */}
          <button
            onClick={() => {
              void logout().then(() => { window.location.href = "/"; });
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all duration-200 w-full"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {(sidebarOpen || mobileMenuOpen) && <span>{t("Logout")}</span>}
          </button>
        </nav>

        {/* User Card in Sidebar Footer */}
        {(sidebarOpen || mobileMenuOpen) && (
          <div className="p-3 border-t border-white/5">
            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-xl p-3 border border-amber-500/10">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{user?.name || "User"}</p>
                  <p className="text-[10px] text-amber-500">Gold Member · Level 3</p>
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full" style={{ width: "65%" }} />
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">85,620 / 100,000 XP</p>
            </div>

            {/* Refer & Earn */}
            <div className="mt-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl p-3 border border-purple-500/10">
              <p className="text-xs font-semibold text-foreground">Refer & Earn</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Invite friends and earn up to 40% commission</p>
              <Link href="/dashboard/referral">
                <button className="mt-2 text-[10px] font-semibold bg-amber-500 text-black px-3 py-1 rounded-lg hover:bg-amber-400 transition-colors">
                  Refer Now
                </button>
              </Link>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-white/5 bg-[oklch(0.12_0.02_255)] flex items-center px-2 sm:px-4 gap-1 sm:gap-3 shrink-0">
          {/* Mobile menu toggle */}
          <button
            type="button"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex min-h-11 min-w-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-white/5 hover:text-foreground lg:hidden"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Sidebar toggle (desktop) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Live Crypto Ticker */}
          <div className="hidden md:flex items-center gap-4 overflow-hidden flex-1">
            <div className="flex items-center gap-4 animate-scroll-x">
              {livePrices.map((pair) => (
                <div key={pair.symbol} className="flex items-center gap-2 text-xs whitespace-nowrap">
                  <span className="text-muted-foreground font-medium">{pair.symbol}/USD</span>
                  <span className="text-foreground font-semibold">${pair.price.toLocaleString()}</span>
                  <span className={(pair.change24h ?? 0) >= 0 ? "text-emerald-400" : "text-red-400"}>{pair.change24h === null ? "—" : `${pair.change24h >= 0 ? "+" : ""}${pair.change24h.toFixed(2)}%`}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              <Search className="w-4 h-4" />
            </button>

            {/* Theme toggle */}
            <button
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
              onClick={toggleTheme}
              className="hidden sm:flex p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* Messages */}
            <button className="hidden sm:block p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors relative">
              <MessageSquare className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-amber-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            {/* Language */}
            <label className="hidden sm:flex items-center gap-1 text-muted-foreground">
              <Globe className="w-4 h-4" aria-hidden="true" />
              <span className="sr-only">{t("Language")}</span>
              <select aria-label={t("Language")} value={language} onChange={(event) => setLanguage(event.target.value as Language)} className="bg-transparent text-xs text-foreground border-0 focus:ring-2 focus:ring-amber-500 rounded">
                <option value="en">EN</option><option value="fr">FR</option><option value="es">ES</option><option value="ar">AR</option><option value="pt">PT</option>
              </select>
            </label>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-xs font-bold">
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-foreground leading-tight">{user?.name || "User"}</p>
                  <p className="text-[10px] text-amber-500">Gold Member</p>
                </div>
                <ChevronDown className="hidden sm:block w-3 h-3 text-muted-foreground" />
              </button>

              <AnimatePresence>
                {userMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-48 bg-popover border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                  >
                    <Link href="/profile">
                      <div className="px-4 py-2.5 text-sm text-foreground hover:bg-white/5 cursor-pointer">Profile</div>
                    </Link>
                    <Link href="/dashboard/settings">
                      <div className="px-4 py-2.5 text-sm text-foreground hover:bg-white/5 cursor-pointer">Settings</div>
                    </Link>
                    <Link href="/dashboard/security">
                      <div className="px-4 py-2.5 text-sm text-foreground hover:bg-white/5 cursor-pointer">Security</div>
                    </Link>
                    <div className="border-t border-white/5" />
                    <button
                      onClick={() => {
                        void logout().finally(() => { window.location.href = "/"; });
                      }}
                      className="w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 text-left"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Search Overlay */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-14 left-0 right-0 z-40 bg-popover border-b border-white/10 p-4 shadow-2xl"
            >
              <div className="max-w-2xl mx-auto relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  autoFocus
                  placeholder="Search anything... (⌘K)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                  onKeyDown={(e) => e.key === "Escape" && setSearchOpen(false)}
                />
                <button onClick={() => setSearchOpen(false)} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main id="dashboard-content" tabIndex={-1} className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary name="dashboard-page" compact>{children}</ErrorBoundary>
        </main>

        {/* AI Assistant Widget */}
        <AIAssistantWidget />

        {/* Footer */}
        <footer className="h-8 border-t border-white/5 bg-[oklch(0.12_0.02_255)] flex items-center justify-center gap-6 px-4 text-[10px] text-muted-foreground shrink-0">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" /> Secure SSL Encryption
          </span>
          <span className="hidden sm:flex items-center gap-1">
            <HeadphonesIcon className="w-3 h-3" /> 24/7 Customer Support
          </span>
          <span className="hidden md:flex items-center gap-1">
            <Shield className="w-3 h-3" /> Licensed & Regulated
          </span>
          <span className="ml-auto">
            Server Time: {new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" })} (UTC)
          </span>
        </footer>
      </div>
    </div>
  );
}

/** Loading skeleton for the dashboard */
function DashboardSkeleton() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar skeleton */}
      <div className="w-64 border-r border-white/5 bg-[oklch(0.12_0.02_255)] p-4 space-y-3 hidden lg:block">
        <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
        <div className="space-y-2 mt-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="h-9 bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 50}ms` }} />
          ))}
        </div>
      </div>
      {/* Main skeleton */}
      <div className="flex-1 p-6 space-y-4">
        <div className="h-14 bg-white/5 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-white/5 rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
          <div className="h-64 bg-white/5 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
