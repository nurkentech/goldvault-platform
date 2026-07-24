import { Link } from "wouter";
import { ArrowLeft, Shield, Lock, CheckCircle } from "lucide-react";

interface PageLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  badge?: string;
  breadcrumb?: string;
}

export default function PageLayout({ children, title, subtitle, badge, breadcrumb }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Top Nav Bar */}
      <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-white/8">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-900 font-black text-xs">GV</div>
            <span className="font-black text-white text-base">Gold<span className="text-amber-400">Vaults</span><span className="text-slate-400 font-normal text-xs">.us</span></span>
          </Link>
          <Link href="/" className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-amber-400 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Page Hero */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-b border-white/8 py-14">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
          {breadcrumb && (
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
              <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
              <span>/</span>
              <span className="text-slate-400">{breadcrumb}</span>
            </div>
          )}
          {badge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-400/25 text-amber-400 text-xs font-semibold mb-4">
              {badge}
            </span>
          )}
          <h1 className="text-4xl lg:text-5xl font-black text-white mb-3">{title}</h1>
          {subtitle && <p className="text-lg text-slate-400 max-w-2xl leading-relaxed">{subtitle}</p>}
        </div>
      </div>

      {/* Page Content */}
      <main className="max-w-[1400px] mx-auto px-4 lg:px-6 py-12">
        {children}
      </main>

      {/* Trust Footer Bar */}
      <div className="border-t border-white/8 bg-slate-950 py-6">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-amber-400" /> SEC Registered</span>
          <span className="flex items-center gap-1.5"><Lock className="w-3.5 h-3.5 text-amber-400" /> ISO 27001 Certified</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-amber-400" /> 99.99% Pure Gold</span>
          <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-amber-400" /> $500M Insurance Fund</span>
          <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-amber-400" /> FCA Authorized</span>
        </div>
      </div>
    </div>
  );
}
