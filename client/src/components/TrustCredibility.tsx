import { Card } from "@/components/ui/card";
import { Star, Award, Lock, CheckCircle, Shield, Zap } from "lucide-react";

export default function TrustCredibility() {
  const testimonials = [
    {
      name: "Sarah Chen",
      title: "Crypto Investor & Portfolio Manager",
      image: "👩‍💼",
      quote: "GoldVault transformed how I diversify. I can now hold physical gold with the liquidity of crypto. The 5% APY is a game-changer.",
      rating: 5,
      verified: true
    },
    {
      name: "Marcus Johnson",
      title: "Traditional Gold Investor",
      image: "👨‍💼",
      quote: "I was skeptical about digital gold, but GoldVault's non-custodial approach and regulatory compliance gave me peace of mind. Best decision ever.",
      rating: 5,
      verified: true
    },
    {
      name: "Elena Rodriguez",
      title: "DeFi Enthusiast & Yield Farmer",
      image: "👩‍🔬",
      quote: "The seamless integration with DeFi protocols is incredible. I'm earning yield on my gold holdings while maintaining full control. Highly recommended!",
      rating: 5,
      verified: true
    },
    {
      name: "David Kim",
      title: "Institutional Investor",
      image: "👨‍💼",
      quote: "GoldVault's institutional tier with API access and dedicated support is exactly what we needed. Professional-grade platform at a fair price.",
      rating: 5,
      verified: true
    }
  ];

  const certifications = [
    {
      name: "SEC Registered",
      description: "Registered with the U.S. Securities and Exchange Commission",
      icon: "🏛️",
      details: "Full compliance with U.S. securities regulations"
    },
    {
      name: "FinCEN Compliant",
      description: "Money Services Business registered with FinCEN",
      icon: "🔐",
      details: "Anti-money laundering (AML) and Know Your Customer (KYC) protocols"
    },
    {
      name: "FCA Authorized",
      description: "Authorized by the UK Financial Conduct Authority",
      icon: "🇬🇧",
      details: "Full regulatory oversight and consumer protection"
    },
    {
      name: "MiCA Compliant",
      description: "Compliant with EU Markets in Crypto-Assets Regulation",
      icon: "🇪🇺",
      details: "Meets all European crypto asset service provider requirements"
    },
    {
      name: "ISO 27001 Certified",
      description: "Information Security Management System certified",
      icon: "🛡️",
      details: "Industry-leading security standards and practices"
    },
    {
      name: "SOC 2 Type II",
      description: "Service Organization Control audit completed",
      icon: "✅",
      details: "Independent verification of security, availability, and confidentiality"
    }
  ];

  const securityFeatures = [
    {
      title: "Multi-Party Computation (MPC)",
      description: "Your private keys are never held in one place. Cryptographic key shares are distributed across secure servers.",
      icon: Lock,
      color: "text-blue-400"
    },
    {
      title: "Cold Storage",
      description: "95% of customer assets stored in offline, air-gapped cold wallets protected by military-grade encryption.",
      icon: Shield,
      color: "text-green-400"
    },
    {
      title: "Insurance Coverage",
      description: "$250M+ in digital asset insurance through Lloyd's of London, covering theft and cyber attacks.",
      icon: Award,
      color: "text-amber-400"
    },
    {
      title: "24/7 Monitoring",
      description: "Real-time threat detection and automated response systems monitor all transactions and access attempts.",
      icon: Zap,
      color: "text-purple-400"
    },
    {
      title: "Regular Audits",
      description: "Independent security audits by top-tier firms (Certora, Trail of Bits) conducted quarterly.",
      icon: CheckCircle,
      color: "text-emerald-400"
    },
    {
      title: "Bug Bounty Program",
      description: "Up to $100,000 rewards for responsible disclosure of security vulnerabilities.",
      icon: Star,
      color: "text-pink-400"
    }
  ];

  const trustMetrics = [
    { metric: "$4.5B+", description: "Assets Under Management" },
    { metric: "500K+", description: "Active Users Worldwide" },
    { metric: "99.99%", description: "Platform Uptime" },
    { metric: "0", description: "Security Breaches" },
    { metric: "100+", description: "Countries Supported" },
    { metric: "24/7", description: "AI Support Available" }
  ];

  return (
    <div className="space-y-16 py-16">
      {/* Trust Metrics */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">Trusted by Investors Worldwide</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            GoldVault is backed by leading investors, regulators, and security experts. Here's why investors trust us.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {trustMetrics.map((item, idx) => (
            <Card key={idx} className="p-6 bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 text-center">
              <p className="text-4xl font-bold text-amber-400 mb-2">{item.metric}</p>
              <p className="text-slate-300">{item.description}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* User Testimonials */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">What Our Users Say</h2>
          <p className="text-xl text-slate-300">Real investors sharing their GoldVault experience</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{testimonial.image}</div>
                  <div>
                    <h3 className="font-semibold text-white">{testimonial.name}</h3>
                    <p className="text-xs text-slate-400">{testimonial.title}</p>
                  </div>
                </div>
                {testimonial.verified && (
                  <div className="flex items-center gap-1 text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </div>
                )}
              </div>

              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              <p className="text-slate-300 italic">{testimonial.quote}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Regulatory Certifications */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">Regulatory Compliance & Certifications</h2>
          <p className="text-xl text-slate-300">Fully regulated and independently audited across major jurisdictions</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certifications.map((cert, idx) => (
            <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-green-500/30 transition">
              <div className="flex items-start gap-4">
                <div className="text-4xl">{cert.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white mb-1">{cert.name}</h3>
                  <p className="text-sm text-slate-400 mb-2">{cert.description}</p>
                  <p className="text-xs text-green-400 font-medium">{cert.details}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Compliance Statement */}
        <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/30">
          <h3 className="font-semibold text-white mb-3">Global Compliance Framework</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            GoldVault operates under a comprehensive regulatory framework designed to protect investors and ensure market integrity. We maintain active registrations with the SEC (U.S.), FCA (UK), and comply with MiCA (EU) and FinCEN requirements. All customer funds are held in segregated accounts, and we undergo independent security audits quarterly. Our commitment to regulatory excellence ensures that your investments are protected by the highest standards of oversight and transparency.
          </p>
        </Card>
      </section>

      {/* Security Features */}
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-bold text-white">Bank-Grade Security</h2>
          <p className="text-xl text-slate-300">Military-grade encryption and institutional-level protection for your assets</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {securityFeatures.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <Card key={idx} className="p-6 bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition">
                <div className="flex items-start gap-4">
                  <Icon className={`w-8 h-8 ${feature.color} flex-shrink-0 mt-1`} />
                  <div>
                    <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Security Badges */}
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-8">
          <h3 className="text-center font-semibold text-white mb-6">Security & Trust Certifications</h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            {[
              { badge: "🔒", label: "ISO 27001" },
              { badge: "✅", label: "SOC 2 Type II" },
              { badge: "🛡️", label: "Penetration Tested" },
              { badge: "🔐", label: "End-to-End Encrypted" }
            ].map((item, idx) => (
              <div key={idx} className="p-4 bg-slate-700/30 rounded-lg">
                <div className="text-3xl mb-2">{item.badge}</div>
                <p className="text-xs font-semibold text-slate-300">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust CTA */}
      <section className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-lg p-8 text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Ready to Invest with Confidence?</h2>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Join thousands of investors who trust GoldVault for secure, regulated, and yield-generating gold investments.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition">
            Get Started Free
          </button>
          <button className="px-8 py-3 border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-semibold rounded-lg transition">
            View Security Report
          </button>
        </div>
      </section>
    </div>
  );
}
