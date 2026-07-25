import { Button } from "@/components/ui/button";
import { ArrowRight, Coins, TrendingUp } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden py-32 px-4">
      {/* Background gradient orb */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="container mx-auto max-w-5xl">
        <div className="text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-amber-500/30 bg-amber-500/10">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-300">Next-Generation Investment Platform</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight">
              Invest in Gold<br />
              <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                With Any Cryptocurrency
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              The world's first unified platform to buy, hold, and earn yield on physical gold using Bitcoin, Ethereum, Solana, and 100+ cryptocurrencies.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex gap-4 justify-center flex-wrap pt-8">
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-6 text-lg">
              Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8 py-6 text-lg">
              View Full Report
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-16">
            <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-amber-500/30 transition">
              <div className="text-3xl font-bold text-amber-400">$4.5B+</div>
              <div className="text-sm text-slate-400 mt-2">Tokenized Gold Market</div>
            </div>
            <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-amber-500/30 transition">
              <div className="text-3xl font-bold text-green-400">2-5%</div>
              <div className="text-sm text-slate-400 mt-2">Annual Yield APY</div>
            </div>
            <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-amber-500/30 transition">
              <div className="text-3xl font-bold text-blue-400">99.99%</div>
              <div className="text-sm text-slate-400 mt-2">Platform Uptime</div>
            </div>
            <div className="p-6 rounded-xl border border-slate-700/50 bg-slate-800/30 backdrop-blur-sm hover:border-amber-500/30 transition">
              <div className="text-3xl font-bold text-purple-400">100+</div>
              <div className="text-sm text-slate-400 mt-2">Crypto Payment Methods</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
