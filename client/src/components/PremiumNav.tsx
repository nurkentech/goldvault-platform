import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "wouter";
import {
  Search, Globe, Sun, Moon, Download, ChevronDown, X, Menu,
  TrendingUp, Wallet, BookOpen, Newspaper, HelpCircle, Info, Mail,
  Zap, BarChart2, ArrowLeftRight, ShoppingCart, Users, Layers, Gift, CreditCard, Landmark,
  User, LogOut, LayoutDashboard, Shield,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

const navLinks = [
  { label: "Home", href: "/" },
  {
    label: "Gold", href: "/buy-gold", icon: TrendingUp,
    sub: [
      { label: "Buy Gold", icon: ShoppingCart, desc: "Buy physical gold with crypto", href: "/buy-gold" },
      { label: "Mint Gold Bars", icon: Layers, desc: "Convert GoldCoins to real bars", href: "/?tab=mint" },
      { label: "Vault Storage", icon: Landmark, desc: "Secure insured vault storage", href: "/vault-storage" },
      { label: "Physical Delivery", icon: Gift, desc: "Deliver gold to your door", href: "/physical-delivery" },
      { label: "GVT Token", icon: Zap, desc: "GoldVaults native token", href: "/gvt-token" },
    ]
  },
  {
    label: "Markets", href: "/markets", icon: BarChart2,
    sub: [
      { label: "Live Markets", icon: BarChart2, desc: "Live crypto & gold prices", href: "/markets" },
      { label: "Exchange", icon: ArrowLeftRight, desc: "Swap crypto for gold", href: "/exchange" },
      { label: "Gold Price Alerts", icon: TrendingUp, desc: "Set price notifications", href: "/gold-price-alerts" },
    ]
  },
  { label: "Exchange", href: "/exchange", icon: ArrowLeftRight },
  {
    label: "Earn", href: "/goldcoins", icon: Gift,
    sub: [
      { label: "GoldCoins Rewards", icon: Gift, desc: "Earn coins, buy gold", href: "/goldcoins" },
      { label: "Referral Program", icon: Users, desc: "Earn for every friend", href: "/referral" },
      { label: "NFC Debit Card", icon: CreditCard, desc: "Tap to pay with gold", href: "/nfc-card" },
    ]
  },
  {
    label: "Learn", href: "/how-it-works", icon: BookOpen,
    sub: [
      { label: "How It Works", icon: BookOpen, desc: "Step-by-step guide", href: "/how-it-works" },
      { label: "Gold vs Bitcoin", icon: BarChart2, desc: "Compare assets", href: "/gold-vs-bitcoin" },
      { label: "Blog & News", icon: Newspaper, desc: "Market insights", href: "/blog" },
      { label: "FAQ", icon: HelpCircle, desc: "Common questions", href: "/faq" },
    ]
  },
  { label: "About", href: "/about", icon: Info },
  { label: "Contact", href: "/contact", icon: Mail },
];

const languages = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "ar", label: "العربية", flag: "🇦🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
];

interface PremiumNavProps {
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export default function PremiumNav({ onLoginClick, onRegisterClick, isDark = true, onToggleDark }: PremiumNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("Home");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const [location, navigate] = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) searchRef.current.focus();
  }, [showSearch]);

  useEffect(() => {
    setMobileOpen(false);
    setMobileSection(null);
  }, [location]);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  const handleNavClick = (label: string, href: string) => {
    setActiveLink(label);
    setOpenDropdown(null);
    setMobileOpen(false);
    if (href.startsWith("/")) {
      navigate(href);
    } else {
      const el = document.querySelector(href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      {/* Main Nav */}
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-slate-900/95 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-black/40"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setActiveLink("Home")}>
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/30">
                <span className="text-slate-900 font-black text-sm">GV</span>
              </div>
              <span className="font-bold text-lg text-white hidden sm:block">
                Gold<span className="text-amber-400">Vaults</span>
                <span className="text-slate-400 text-xs font-normal">.us</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden xl:flex items-center gap-0.5">
              {navLinks.slice(0, 8).map((link) => (
                <div
                  key={link.label}
                  className="relative"
                  onMouseEnter={() => link.sub && setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <button
                    onClick={() => handleNavClick(link.label, link.href)}
                    className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeLink === link.label
                        ? "text-amber-400 bg-amber-400/10"
                        : "text-slate-300 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    {link.label}
                    {link.sub && (
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${openDropdown === link.label ? "rotate-180" : ""}`} />
                    )}
                  </button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.sub && openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                        className="absolute top-full left-0 mt-1 w-56 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                      >
                        {link.sub.map((item) => (
                          <button
                            key={item.label}
                            onClick={() => handleNavClick(item.label, item.href)}
                            className="w-full flex items-start gap-3 px-4 py-3 hover:bg-white/8 transition-colors text-left group"
                          >
                            <item.icon className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                            <div>
                              <div className="text-sm font-medium text-white group-hover:text-amber-400 transition-colors">{item.label}</div>
                              <div className="text-xs text-slate-400">{item.desc}</div>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <AnimatePresence mode="wait">
                {showSearch ? (
                  <motion.div
                    key="search-open"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    className="hidden overflow-hidden sm:block"
                  >
                    <div className="flex items-center bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 gap-2">
                      <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <input
                        ref={searchRef}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search crypto..."
                        className="bg-transparent text-sm text-white placeholder-slate-500 outline-none w-full"
                      />
                      <button onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                        <X className="w-3.5 h-3.5 text-slate-400 hover:text-white" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.button
                    key="search-icon"
                    onClick={() => setShowSearch(true)}
                    className="hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all sm:block"
                  >
                    <Search className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Language */}
              <div className="relative hidden md:block">
                <button
                  onClick={() => setShowLang(!showLang)}
                  className="flex items-center gap-1.5 p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all"
                >
                  <Globe className="w-4 h-4" />
                  <span className="text-xs font-medium hidden lg:block">{selectedLang.code.toUpperCase()}</span>
                </button>
                <AnimatePresence>
                  {showLang && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1 w-44 bg-slate-800/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                    >
                      {languages.map((lang) => (
                        <button
                          key={lang.code}
                          onClick={() => { setSelectedLang(lang); setShowLang(false); }}
                          className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors ${
                            selectedLang.code === lang.code
                              ? "bg-amber-400/10 text-amber-400"
                              : "text-slate-300 hover:bg-white/8 hover:text-white"
                          }`}
                        >
                          <span>{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Dark/Light toggle */}
              <button
                onClick={onToggleDark}
                className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/8 transition-all hidden md:flex"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Auth buttons / User avatar */}
              {isAuthenticated && user ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/8 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black text-xs shadow-md">
                      {(user.name ?? "GV").split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    <span className="text-sm text-white font-medium hidden lg:block max-w-[100px] truncate">{user.name ?? "Account"}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-1 w-52 bg-slate-800/98 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/10">
                          <p className="text-white text-sm font-semibold truncate">{user.name ?? "GoldVaults User"}</p>
                          <p className="text-slate-400 text-xs truncate">{user.email ?? ""}</p>
                        </div>
                        {[
                          { icon: User, label: "My Profile", href: "/profile" },
                          { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
                          { icon: Wallet, label: "Wallet", href: "/wallet" },
                          { icon: Shield, label: "Security", href: "/profile" },
                        ].map(({ icon: Icon, label, href }) => (
                          <button
                            key={label}
                            onClick={() => { navigate(href); setShowUserMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
                          >
                            <Icon className="w-4 h-4 text-slate-400" /> {label}
                          </button>
                        ))}
                        <div className="border-t border-white/10">
                          <button
                            onClick={() => { logout(); setShowUserMenu(false); }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                          >
                            <LogOut className="w-4 h-4" /> Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <button
                    onClick={onLoginClick}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-white/8 transition-all"
                  >
                    Login
                  </button>
                  <button
                    onClick={onRegisterClick}
                    className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-slate-900 transition-all shadow-lg shadow-amber-500/25 active:scale-[0.97]"
                  >
                    Register
                  </button>
                </>
              )}

              {/* Download App */}
              <button
                onClick={() => toast.info("App coming soon!", { description: "The GoldVaults mobile app is launching soon." })}
                className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-sm font-medium text-slate-300 border border-white/10 hover:border-amber-400/50 hover:text-amber-400 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                App
              </button>

              {/* Mobile menu button */}
              <button
                type="button"
                aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
                aria-controls="mobile-navigation"
                aria-expanded={mobileOpen}
                onClick={() => {
                  setMobileOpen((open) => !open);
                  setShowLang(false);
                  setShowUserMenu(false);
                }}
                className="xl:hidden min-h-11 min-w-11 p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/8 transition-all flex items-center justify-center"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
              className="xl:hidden max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-slate-900/98 backdrop-blur-xl border-t border-white/10 shadow-2xl"
            >
              <div id="mobile-navigation" className="mx-auto w-full max-w-xl px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <div key={link.label} className="overflow-hidden rounded-xl">
                      <div className="flex items-stretch">
                        <button
                          type="button"
                          onClick={() => handleNavClick(link.label, link.href)}
                          className={`flex min-h-11 flex-1 items-center gap-3 px-3 py-2.5 text-left text-sm font-medium transition-all ${
                            activeLink === link.label
                              ? "text-amber-400 bg-amber-400/10"
                              : "text-slate-200 hover:text-white hover:bg-white/8"
                          }`}
                        >
                          {link.icon ? <link.icon className="w-4 h-4 shrink-0" /> : <LayoutDashboard className="w-4 h-4 shrink-0" />}
                          <span>{link.label}</span>
                        </button>
                        {link.sub && (
                          <button
                            type="button"
                            aria-label={`${mobileSection === link.label ? "Collapse" : "Expand"} ${link.label} menu`}
                            aria-expanded={mobileSection === link.label}
                            onClick={() => setMobileSection((section) => section === link.label ? null : link.label)}
                            className="flex min-h-11 min-w-11 items-center justify-center text-slate-400 hover:bg-white/8 hover:text-white"
                          >
                            <ChevronDown className={`h-4 w-4 transition-transform ${mobileSection === link.label ? "rotate-180" : ""}`} />
                          </button>
                        )}
                      </div>
                      <AnimatePresence initial={false}>
                        {link.sub && mobileSection === link.label && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden bg-white/[0.03]"
                          >
                            <div className="space-y-1 p-2">
                              {link.sub.map((item) => (
                                <button
                                  type="button"
                                  key={item.label}
                                  onClick={() => handleNavClick(item.label, item.href)}
                                  className="flex min-h-11 w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-white/8"
                                >
                                  <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                                  <span>
                                    <span className="block text-sm font-medium text-white">{item.label}</span>
                                    <span className="block text-xs text-slate-400">{item.desc}</span>
                                  </span>
                                </button>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>

                <div className={`mt-3 grid gap-2 border-t border-white/10 pt-3 ${onToggleDark ? "grid-cols-2" : "grid-cols-1"}`}>
                  <label className="flex min-h-11 items-center gap-2 rounded-lg border border-white/10 px-3 text-sm text-slate-300">
                    <Globe className="h-4 w-4 shrink-0" />
                    <span className="sr-only">Language</span>
                    <select
                      value={selectedLang.code}
                      onChange={(event) => {
                        const language = languages.find((item) => item.code === event.target.value);
                        if (language) setSelectedLang(language);
                      }}
                      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    >
                      {languages.map((language) => (
                        <option key={language.code} value={language.code} className="bg-slate-900">
                          {language.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  {onToggleDark && (
                    <button
                      type="button"
                      onClick={onToggleDark}
                      className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/10 text-sm text-slate-300 hover:border-amber-400/50 hover:text-amber-400"
                    >
                      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                      {isDark ? "Light" : "Dark"}
                    </button>
                  )}
                </div>

                <div className="mt-3 flex flex-col gap-2 border-t border-white/10 pt-3 min-[420px]:flex-row">
                  {isAuthenticated && user ? (
                    <>
                      <button onClick={() => { navigate("/profile"); setMobileOpen(false); }} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 text-sm font-medium text-slate-300 transition-all hover:border-amber-400/50 hover:text-amber-400">
                        <User className="w-4 h-4" /> Profile
                      </button>
                      <button onClick={() => { void logout(); setMobileOpen(false); }} className="flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-red-500/20 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/30">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setMobileOpen(false); onLoginClick?.(); }} className="min-h-11 flex-1 rounded-lg border border-white/10 text-sm font-medium text-slate-300 transition-all hover:border-amber-400/50 hover:text-amber-400">
                        Login
                      </button>
                      <button onClick={() => { setMobileOpen(false); onRegisterClick?.(); }} className="min-h-11 flex-1 rounded-lg bg-amber-500 text-sm font-semibold text-slate-900 transition-all hover:bg-amber-400">
                        Register
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
