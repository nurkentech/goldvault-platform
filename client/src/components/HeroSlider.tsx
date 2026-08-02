import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, TrendingUp, Shield, Zap, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

const slides = [
  {
    id: 1,
    badge: "🥇 The Gold Standard of Crypto Investing",
    title: "Buy Physical Gold",
    titleGold: "With Crypto",
    subtitle: "Convert supported cryptocurrencies into available gold products and manage them from your GoldVaults account.",
    cta1: "Get Started",
    cta2: "View Gold Prices",
    primaryCtaUrl: "#signup",
    secondaryCtaUrl: "/markets",
    heroImageUrl: "/manus-storage/hero-bg_ff436ad1.jpg",
    coins: ["₿", "🏅", "Ξ", "🪙", "◎"],
    coinColors: ["text-amber-400", "text-yellow-300", "text-blue-400", "text-amber-300", "text-purple-400"],
    gradient: "from-slate-900 via-amber-950/30 to-slate-900",
    accentGradient: "from-amber-500/20 to-transparent",
    stats: [
      { label: "Account protection", value: "2FA" },
      { label: "Market access", value: "24/7" },
      { label: "Portfolio view", value: "Unified" },
    ],
  },
  {
    id: 2,
    badge: "Gold and Crypto Account Tools",
    title: "Manage Your",
    titleGold: "Digital Portfolio",
    subtitle: "Review wallets, market information, transactions, rewards, and available investment tools in one secure account.",
    cta1: "Open Dashboard",
    cta2: "Explore Markets",
    primaryCtaUrl: "/dashboard",
    secondaryCtaUrl: "/markets",
    heroImageUrl: "/manus-storage/hero-bg_ff436ad1.jpg",
    coins: ["🏦", "₿", "🔄", "🪙", "📦"],
    coinColors: ["text-amber-300", "text-amber-400", "text-green-400", "text-yellow-400", "text-orange-400"],
    gradient: "from-slate-900 via-yellow-950/20 to-slate-900",
    accentGradient: "from-yellow-500/20 to-transparent",
    stats: [
      { label: "Wallet tools", value: "Live" },
      { label: "Market data", value: "Current" },
      { label: "Account history", value: "Tracked" },
    ],
  },
  {
    id: 3,
    badge: "Research Before You Invest",
    title: "Make Informed",
    titleGold: "Asset Decisions",
    subtitle: "Use market, security, and educational resources to understand products and risks before making an investment decision.",
    cta1: "How It Works",
    cta2: "Security Overview",
    primaryCtaUrl: "/how-it-works",
    secondaryCtaUrl: "/security",
    heroImageUrl: "/manus-storage/hero-bg_ff436ad1.jpg",
    coins: ["🔐", "🏅", "📜", "🏛️", "✅"],
    coinColors: ["text-green-400", "text-yellow-300", "text-blue-400", "text-cyan-400", "text-emerald-400"],
    gradient: "from-slate-900 via-emerald-950/20 to-slate-900",
    accentGradient: "from-emerald-500/20 to-transparent",
    stats: [
      { label: "Risk information", value: "Available" },
      { label: "Security controls", value: "Enabled" },
      { label: "Support", value: "Accessible" },
    ],
  },
];

interface HeroSliderProps {
  onGetStarted?: () => void;
}

export default function HeroSlider({ onGetStarted }: HeroSliderProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [, navigate] = useLocation();
  const { data: website } = trpc.content.website.useQuery(undefined, {
    staleTime: 60_000,
    retry: false,
  });
  const managedHome = website?.home;
  const managedSlides = managedHome?.slides?.filter((slide) => slide.enabled) ?? [];
  const displaySlides = managedSlides.length > 0
    ? managedSlides.map((content, index) => {
        const theme = slides[index % slides.length];
        return {
          ...theme,
          ...content,
          titleGold: content.titleAccent,
          cta1: content.primaryCtaLabel,
          cta2: content.secondaryCtaLabel,
        };
      })
    : slides;
  const slideCount = displaySlides.length;
  const safeCurrent = current % slideCount;

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrent((c) => (c + 1) % slideCount);
    }, 5000);
    return () => clearInterval(timer);
  }, [slideCount]);

  const goTo = (idx: number) => {
    setDirection(idx > safeCurrent ? 1 : -1);
    setCurrent(idx);
  };

  const slide = displaySlides[safeCurrent];

  const followCta = (destination: string) => {
    if (destination === "#signup") {
      onGetStarted?.();
      return;
    }
    if (/^https:\/\//i.test(destination)) {
      window.location.assign(destination);
      return;
    }
    navigate(destination);
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <section id="home" className={`relative min-h-screen overflow-hidden flex items-center`}
      style={{ background: "#0a0f1e" }}>

      {/* Hero background image */}
      <div className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url('${slide.heroImageUrl || "/manus-storage/hero-bg_ff436ad1.jpg"}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 z-0 bg-slate-950/75" />

      {/* Animated tinted gradient overlay per slide */}
      <motion.div
        key={current}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`absolute inset-0 z-0 bg-gradient-to-r ${slide.accentGradient} pointer-events-none`}
        style={{ opacity: 0.25 }}
      />

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.04]" style={{
        backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
        backgroundSize: "50px 50px"
      }} />

      {/* Floating coin emojis */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {slide.coins.map((coin, i) => (
          <motion.div
            key={`${current}-${i}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: [0, 0.6, 0.6, 0],
              y: [20, -20],
              x: [0, (i % 2 === 0 ? 10 : -10)],
            }}
            transition={{
              duration: 4 + i,
              delay: i * 0.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className={`absolute text-4xl ${slide.coinColors[i]}`}
            style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
            }}
          >
            {coin}
          </motion.div>
        ))}
      </div>

      {/* Glowing orbs */}
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-[1400px] mx-auto px-4 lg:px-6 pt-24 pb-16 w-full">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={slide.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="max-w-3xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-sm font-medium mb-6"
            >
              {slide.badge}
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight mb-4"
            >
              <span className="text-white">{slide.title}</span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                {slide.titleGold}
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg text-slate-300 leading-relaxed mb-8 max-w-xl"
            >
              {slide.subtitle}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="flex flex-wrap gap-4 mb-12"
            >
              <button
                onClick={() => followCta(slide.primaryCtaUrl)}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-900 font-bold text-base transition-all shadow-xl shadow-amber-500/30 hover:shadow-amber-400/40 active:scale-[0.97] hover:scale-[1.02]"
              >
                {slide.cta1}
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => followCta(slide.secondaryCtaUrl)}
                className="flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/20 text-white font-semibold text-base hover:bg-white/8 hover:border-white/30 transition-all active:scale-[0.97]"
              >
                {slide.cta2}
              </button>
            </motion.div>

            {/* Stats row */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-8"
            >
              {slide.stats.map((stat, i) => (
                <div key={i} className="flex flex-col">
                  <span className="text-2xl font-black text-amber-400">{stat.value}</span>
                  <span className="text-sm text-slate-400">{stat.label}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3">
          <button onClick={() => goTo((safeCurrent - 1 + slideCount) % slideCount)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>
          {displaySlides.map((item, i) => (
            <button
              key={item.id}
              onClick={() => goTo(i)}
              className={`transition-all duration-300 rounded-full ${
                i === safeCurrent ? "w-8 h-2 bg-amber-400" : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
          <button onClick={() => goTo((safeCurrent + 1) % slideCount)} className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-all">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-8 right-6 hidden lg:flex items-center gap-4"
        >
          {[
            { icon: Shield, label: "Security Controls" },
            { icon: Zap, label: "Account Tools" },
            { icon: TrendingUp, label: "Market Information" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
              <Icon className="w-3.5 h-3.5 text-amber-400" />
              {label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
