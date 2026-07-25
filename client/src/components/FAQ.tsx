import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, ChevronDown } from "lucide-react";

export default function FAQ() {
  const [searchTerm, setSearchTerm] = useState("");

  const faqCategories = [
    {
      category: "Crypto-to-Gold Conversion",
      icon: "💱",
      questions: [
        {
          q: "How does the crypto-to-gold conversion process work?",
          a: "When you deposit cryptocurrency, our system instantly converts it to gold-backed tokens (PAXG or XAUT) at real-time market rates. The conversion happens on-chain through our smart contracts, ensuring transparency and eliminating intermediaries. You receive your gold tokens within 1-2 minutes, and they're immediately credited to your GoldVault account."
        },
        {
          q: "What cryptocurrencies do you accept?",
          a: "We accept 100+ cryptocurrencies including Bitcoin (BTC), Ethereum (ETH), Solana (SOL), Ripple (XRP), Cardano (ADA), Polkadot (DOT), and all major stablecoins (USDC, USDT, DAI). We also support payments via DeFi protocols like Aave, Compound, and Uniswap. Check our payment page for the complete list of supported assets."
        },
        {
          q: "Are there any fees for crypto-to-gold conversion?",
          a: "Conversion fees range from 0.5% to 1.5% depending on your account tier (Starter, Pro, Institutional). This includes the blockchain transaction fee and our platform fee. Pro and Institutional members enjoy lower spreads. There are no hidden fees—all costs are displayed before you confirm the transaction."
        },
        {
          q: "What exchange rate do you use?",
          a: "We use real-time market rates from major exchanges (Binance, Kraken, Coinbase) aggregated through our price oracle. The rate is locked in the moment you initiate the transaction. For large institutional orders (>$1M), we offer custom pricing. Our rates are typically 0.1-0.3% better than traditional dealers."
        },
        {
          q: "Can I convert back from gold to crypto?",
          a: "Yes! You can convert your gold-backed tokens back to any supported cryptocurrency at any time, 24/7. The process is identical to the initial conversion—instant, transparent, and with the same low fees. No minimum holding period required."
        }
      ]
    },
    {
      category: "Withdrawals & Liquidity",
      icon: "💰",
      questions: [
        {
          q: "How long does it take to withdraw my gold?",
          a: "Crypto withdrawals are instant (1-2 minutes). For fiat withdrawals (USD, EUR, GBP), the timeline depends on your bank: typically 1-3 business days for standard transfers, or same-day for premium wire transfers. Physical gold delivery takes 5-7 business days after verification."
        },
        {
          q: "What's the minimum withdrawal amount?",
          a: "Minimum withdrawal is $1 for crypto transfers and $100 for fiat withdrawals. There's no maximum limit. Institutional accounts can arrange custom withdrawal schedules and bulk transfers."
        },
        {
          q: "Can I withdraw physical gold bars?",
          a: "Yes! Institutional and Pro members can request physical gold delivery. We partner with certified vaults and logistics providers to ship insured, audited gold bars directly to your address. Typical delivery takes 5-7 business days. Fees are $50-200 depending on quantity and destination."
        },
        {
          q: "Are there withdrawal limits?",
          a: "No daily or monthly withdrawal limits for verified accounts. However, large withdrawals (>$1M) may require additional verification for compliance purposes. Institutional accounts have custom limits based on their agreement."
        },
        {
          q: "What if I want to withdraw during market volatility?",
          a: "You can withdraw anytime, regardless of market conditions. Your withdrawal is processed at the current market rate at the moment of request. We don't impose any lockup periods or volatility-based restrictions."
        }
      ]
    },
    {
      category: "Security & Asset Protection",
      icon: "🔐",
      questions: [
        {
          q: "How is my gold stored and protected?",
          a: "95% of customer assets are stored in offline, air-gapped cold wallets using Multi-Party Computation (MPC) technology. Your private keys are never held in one location—they're cryptographically split across secure servers. Physical gold is stored in Tier-1 vaults (London, Singapore, New York) with 24/7 surveillance and insurance coverage."
        },
        {
          q: "What insurance coverage do I have?",
          a: "All customer assets are covered by $250M+ in digital asset insurance through Lloyd's of London. This covers theft, cyber attacks, and operational failures. Physical gold is insured through specialized precious metals insurers. Coverage is automatic—no additional premium required."
        },
        {
          q: "Is my account protected if GoldVault is hacked?",
          a: "Yes. Our non-custodial architecture means your assets are never held by GoldVault. Even if our systems are compromised, your gold remains secure in cold storage. Additionally, our $250M insurance policy covers any losses. We've undergone independent security audits by Certora and Trail of Bits with zero critical vulnerabilities found."
        },
        {
          q: "How do you prevent unauthorized access to my account?",
          a: "We use industry-leading security measures: 2FA (Two-Factor Authentication), biometric login, IP whitelisting, and device fingerprinting. Your private keys are encrypted with AES-256 and never transmitted over the internet. We monitor all account activity in real-time and alert you of any suspicious behavior."
        },
        {
          q: "What happens if I lose my password?",
          a: "You can reset your password using your registered email or phone number with SMS verification. Since we use non-custodial wallets, your assets remain secure even if your password is compromised. We recommend enabling 2FA and storing your recovery phrase in a secure location."
        },
        {
          q: "Do you have a bug bounty program?",
          a: "Yes! We offer up to $100,000 in rewards for responsible disclosure of security vulnerabilities. Researchers can report issues through our HackerOne program. We take security seriously and reward ethical hackers for helping us maintain our platform's integrity."
        }
      ]
    },
    {
      category: "Regulatory & Compliance",
      icon: "⚖️",
      questions: [
        {
          q: "Is GoldVault regulated?",
          a: "Yes, fully regulated. We're registered with the SEC (U.S.), authorized by the FCA (UK), and compliant with MiCA (EU). We maintain FinCEN registration as a Money Services Business and comply with AML/KYC requirements in all jurisdictions. Our compliance team undergoes quarterly audits."
        },
        {
          q: "Do I need to provide KYC information?",
          a: "Yes. We require KYC (Know Your Customer) verification for all accounts to comply with anti-money laundering regulations. The process takes 5-10 minutes and requires government ID, proof of address, and source of funds verification. This protects you and ensures the platform operates legally."
        },
        {
          q: "Are there tax implications for holding gold on GoldVault?",
          a: "Tax treatment depends on your jurisdiction. In most countries, gold-backed tokens are treated as commodities or securities. We provide automated tax reports (Form 8949 for US, equivalent for other countries) that you can submit to your tax advisor. We recommend consulting a tax professional about your specific situation."
        },
        {
          q: "Is GoldVault available in my country?",
          a: "We operate in 100+ countries. However, some jurisdictions restrict crypto or commodity trading. We cannot serve customers in sanctioned countries or those with strict crypto bans (e.g., China, North Korea). Check our Supported Countries page or contact support to verify your location."
        },
        {
          q: "How do you handle regulatory changes?",
          a: "We actively monitor regulatory developments globally and adjust our policies accordingly. Our compliance team includes former regulators and legal experts. If new regulations affect your account, we'll notify you immediately and provide guidance on your options."
        }
      ]
    },
    {
      category: "Yield & DeFi Integration",
      icon: "📈",
      questions: [
        {
          q: "How do I earn yield on my gold?",
          a: "Your gold-backed tokens can be staked in DeFi protocols like Aave, Compound, and Curve to earn 2-5% APY. Alternatively, you can use our automated yield strategy, which rebalances your holdings across multiple protocols to maximize returns while minimizing risk. Yield is compounded automatically."
        },
        {
          q: "What's the difference between staking and lending?",
          a: "Staking involves locking your tokens in a smart contract to earn rewards. Lending means depositing your tokens into a lending protocol where they're lent to borrowers, and you earn interest. Both generate yield, but staking typically offers higher returns with lower risk."
        },
        {
          q: "Can I lose my gold through DeFi yield strategies?",
          a: "There's always smart contract risk when using DeFi. However, we only partner with audited protocols (Aave, Compound, Curve) with strong security records. Your principal is protected by insurance. We recommend starting with small amounts and gradually increasing exposure as you become comfortable with DeFi."
        },
        {
          q: "What happens to my yield if I withdraw?",
          a: "Yield accrues continuously and is automatically compounded. If you withdraw, you receive your principal plus all accrued yield. There's no penalty for early withdrawal. You can withdraw at any time without losing any earned yield."
        },
        {
          q: "Are there risks with DeFi yield farming?",
          a: "Yes, DeFi carries risks including smart contract vulnerabilities, liquidity risks, and impermanent loss. We mitigate these by using only top-tier audited protocols and diversifying across multiple strategies. Your insurance covers smart contract failures. Start conservatively and increase exposure gradually."
        }
      ]
    },
    {
      category: "Account & Platform",
      icon: "👤",
      questions: [
        {
          q: "How do I create an account?",
          a: "Visit GoldVault.com, click 'Get Started', and follow the 3-step signup: (1) Email/phone verification, (2) KYC verification (5-10 minutes), (3) Fund your account. You'll have full access immediately after KYC approval. No credit check required."
        },
        {
          q: "What are the different account tiers?",
          a: "We offer three tiers: Starter (Free) - basic features, 1% spread; Pro ($9.99/mo) - DeFi yield, 0.5% spread, robo-advisory; Institutional (Custom) - API access, dedicated support, custom pricing. Upgrade anytime with no penalties."
        },
        {
          q: "Can I use GoldVault on mobile?",
          a: "Yes! Our mobile app (iOS & Android) offers full functionality: buy/sell gold, track prices, manage yield, withdraw funds. The app includes biometric login, push notifications for price alerts, and offline access to your portfolio."
        },
        {
          q: "How do I contact customer support?",
          a: "24/7 support via: AI chat (instant), email (support@goldvault.com, <4hr response), phone (Pro/Institutional members), or live chat. Our AI representative handles 95% of queries instantly. For complex issues, you're escalated to a human specialist."
        },
        {
          q: "Can I close my account?",
          a: "Yes, anytime. Simply withdraw all funds and request account closure. We'll delete your personal data within 30 days (except where legally required to retain records). No penalties or fees for closing."
        }
      ]
    },
    {
      category: "Pricing & Fees",
      icon: "💳",
      questions: [
        {
          q: "What are your fees?",
          a: "Trading spreads: 0.5-1.5% (depending on tier). Subscription: Free (Starter), $9.99/mo (Pro), Custom (Institutional). Withdrawal: Free for crypto, $0-50 for fiat, $50-200 for physical gold. No hidden fees—all costs shown before transaction."
        },
        {
          q: "How do your fees compare to competitors?",
          a: "We're 40-60% cheaper than traditional gold dealers (2-3% spreads). Compared to crypto exchanges, our spreads are competitive (0.5-1.5% vs. 0.1-0.5%), but you get gold exposure, not just crypto. Our all-in-one platform eliminates multiple fees."
        },
        {
          q: "Are there any monthly maintenance fees?",
          a: "No monthly maintenance fees for Starter or Pro accounts. Institutional accounts may have custom fees based on their agreement. Your assets earn yield automatically—no inactivity fees or minimum balance requirements."
        },
        {
          q: "Do you charge fees for deposits?",
          a: "No deposit fees! We only charge when you convert crypto to gold (0.5-1.5% spread) or withdraw. Deposits are free regardless of amount or cryptocurrency used."
        }
      ]
    }
  ];

  // Filter FAQs based on search term
  const filteredCategories = faqCategories.map(cat => ({
    ...cat,
    questions: cat.questions.filter(q =>
      q.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.a.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.questions.length > 0);

  const displayCategories = searchTerm ? filteredCategories : faqCategories;

  return (
    <div className="space-y-12 py-16">
      {/* FAQ Header */}
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-bold text-white">Frequently Asked Questions</h2>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto">
          Find answers to common questions about crypto-to-gold conversions, withdrawals, security, and more.
        </p>
      </section>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-3.5 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQ... (e.g., 'withdrawal', 'security', 'fees')"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-amber-500 transition"
          />
        </div>
        {searchTerm && (
          <p className="mt-2 text-sm text-slate-400">
            Found {displayCategories.reduce((sum, cat) => sum + cat.questions.length, 0)} matching questions
          </p>
        )}
      </div>

      {/* FAQ Categories */}
      <div className="space-y-8">
        {displayCategories.length > 0 ? (
          displayCategories.map((category, catIdx) => (
            <div key={catIdx} className="space-y-4">
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">{category.icon}</span>
                <h3 className="text-2xl font-bold text-white">{category.category}</h3>
                <span className="ml-auto text-sm text-slate-400 bg-slate-800/50 px-3 py-1 rounded-full">
                  {category.questions.length} questions
                </span>
              </div>

              {/* Accordion */}
              <Accordion type="single" collapsible className="space-y-3">
                {category.questions.map((item, qIdx) => (
                  <AccordionItem
                    key={qIdx}
                    value={`${catIdx}-${qIdx}`}
                    className="border border-slate-700/50 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition overflow-hidden"
                  >
                    <AccordionTrigger className="px-6 py-4 hover:no-underline group">
                      <div className="flex items-start gap-3 text-left">
                        <ChevronDown className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5 group-data-[state=open]:rotate-180 transition-transform" />
                        <span className="text-white font-semibold group-hover:text-amber-400 transition">
                          {item.q}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6 pb-4 pt-0 text-slate-300 leading-relaxed">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          ))
        ) : (
          <Card className="p-12 bg-slate-800/30 border-slate-700/50 text-center">
            <p className="text-slate-400 text-lg">No questions found matching "{searchTerm}"</p>
            <p className="text-slate-500 text-sm mt-2">Try searching for different keywords or browse all categories</p>
          </Card>
        )}
      </div>

      {/* Still Have Questions CTA */}
      <section className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 rounded-lg p-8 text-center space-y-4">
        <h3 className="text-2xl font-bold text-white">Still Have Questions?</h3>
        <p className="text-slate-300 max-w-2xl mx-auto">
          Our 24/7 AI support team is ready to help. Chat with us instantly or contact our specialists for complex inquiries.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition">
            Chat with AI Support
          </button>
          <button className="px-8 py-3 border border-amber-500/50 text-amber-400 hover:bg-amber-500/10 font-semibold rounded-lg transition">
            Contact Specialist
          </button>
        </div>
      </section>

      {/* FAQ Stats */}
      <div className="grid md:grid-cols-3 gap-6 bg-slate-800/30 border border-slate-700/50 rounded-lg p-8">
        <div className="text-center">
          <p className="text-3xl font-bold text-amber-400 mb-2">{faqCategories.reduce((sum, cat) => sum + cat.questions.length, 0)}+</p>
          <p className="text-slate-300">Questions Answered</p>
        </div>
        <div className="text-center border-l border-r border-slate-700">
          <p className="text-3xl font-bold text-amber-400 mb-2">24/7</p>
          <p className="text-slate-300">AI Support Available</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-amber-400 mb-2">&lt;2min</p>
          <p className="text-slate-300">Average Response Time</p>
        </div>
      </div>
    </div>
  );
}
