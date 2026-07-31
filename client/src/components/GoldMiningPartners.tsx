import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  ArrowRight,
  Building2,
  ExternalLink,
  Globe2,
  MapPin,
  Pickaxe,
  Search,
  ShieldAlert,
} from "lucide-react";

const miningCompanies = [
  {
    name: "Barrick Mining",
    ticker: "GOLD",
    headquarters: "Canada",
    regions: ["Americas", "Africa", "Asia-Pacific"],
    focus: "Large-scale gold and copper operations",
    website: "https://www.barrick.com/",
  },
  {
    name: "Newmont",
    ticker: "NEM",
    headquarters: "United States",
    regions: ["Americas", "Africa", "Australia"],
    focus: "Global gold production and mine development",
    website: "https://www.newmont.com/",
  },
  {
    name: "Agnico Eagle Mines",
    ticker: "AEM",
    headquarters: "Canada",
    regions: ["Canada", "Europe", "Australia", "Mexico"],
    focus: "Gold exploration, development, and production",
    website: "https://www.agnicoeagle.com/",
  },
  {
    name: "AngloGold Ashanti",
    ticker: "AU",
    headquarters: "United States",
    regions: ["Africa", "Americas", "Australia"],
    focus: "International gold mining portfolio",
    website: "https://www.anglogoldashanti.com/",
  },
  {
    name: "Kinross Gold",
    ticker: "KGC",
    headquarters: "Canada",
    regions: ["Americas", "West Africa"],
    focus: "Gold mining and development projects",
    website: "https://www.kinross.com/",
  },
  {
    name: "Gold Fields",
    ticker: "GFI",
    headquarters: "South Africa",
    regions: ["Africa", "Australia", "Americas"],
    focus: "Diversified international gold operations",
    website: "https://www.goldfields.com/",
  },
];

export default function GoldMiningPartners() {
  const [query, setQuery] = useState("");
  const [region, setRegion] = useState("All regions");

  const regions = useMemo(
    () => [
      "All regions",
      ...Array.from(new Set(miningCompanies.flatMap(company => company.regions))).sort(),
    ],
    [],
  );

  const filteredCompanies = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return miningCompanies.filter(company => {
      const matchesQuery = !normalizedQuery || [
        company.name,
        company.ticker,
        company.headquarters,
        company.focus,
        ...company.regions,
      ].some(value => value.toLowerCase().includes(normalizedQuery));
      const matchesRegion = region === "All regions" || company.regions.includes(region);
      return matchesQuery && matchesRegion;
    });
  }, [query, region]);

  return (
    <section className="space-y-7 py-6" aria-labelledby="mining-explorer-heading">
      <div className="rounded-3xl border border-amber-500/20 bg-gradient-to-br from-amber-500/10 via-slate-900 to-slate-950 p-6 md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <Pickaxe className="h-3.5 w-3.5" /> Mining research
        </div>
        <h2 id="mining-explorer-heading" className="mt-4 text-3xl font-black text-white">Gold Mining Company Explorer</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">
          Explore established gold-mining companies, visit their official investor resources, and compare their operating regions before making an independent decision.
        </p>
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs leading-relaxed text-blue-200">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
          This is a research watchlist—not a statement that these companies partner with, endorse, or provide royalty streams to GoldVaults. Company securities and mining projects carry market, operational, political, and environmental risk.
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Building2 className="h-5 w-5 text-amber-400" />
          <p className="mt-3 text-2xl font-black text-white">{miningCompanies.length}</p>
          <p className="text-xs text-slate-400">Companies in the watchlist</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <Globe2 className="h-5 w-5 text-amber-400" />
          <p className="mt-3 text-2xl font-black text-white">{regions.length - 1}</p>
          <p className="text-xs text-slate-400">Operating regions represented</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <ExternalLink className="h-5 w-5 text-amber-400" />
          <p className="mt-3 text-2xl font-black text-white">Official</p>
          <p className="text-xs text-slate-400">Company research destinations</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">Search mining companies</span>
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder="Search company, ticker, or location…"
            className="w-full rounded-xl border border-white/10 bg-slate-900 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-amber-500/50"
          />
        </label>
        <label>
          <span className="sr-only">Filter by operating region</span>
          <select
            value={region}
            onChange={event => setRegion(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-slate-900 px-3 py-2.5 text-sm text-white outline-none focus:border-amber-500/50 sm:w-48"
          >
            {regions.map(option => <option key={option}>{option}</option>)}
          </select>
        </label>
      </div>

      {filteredCompanies.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-10 text-center">
          <p className="font-semibold text-white">No mining companies match this filter.</p>
          <button onClick={() => { setQuery(""); setRegion("All regions"); }} className="mt-2 text-sm text-amber-400">Clear filters</button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredCompanies.map(company => (
            <article key={company.ticker} className="flex flex-col rounded-2xl border border-white/10 bg-white/5 p-5 transition-colors hover:border-amber-500/30">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-400">{company.ticker}</p>
                  <h3 className="mt-1 text-lg font-bold text-white">{company.name}</h3>
                </div>
                <div className="rounded-xl bg-amber-500/10 p-2 text-amber-400"><Pickaxe className="h-5 w-5" /></div>
              </div>
              <p className="mt-3 text-sm text-slate-300">{company.focus}</p>
              <p className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                <MapPin className="h-3.5 w-3.5" /> Headquarters: {company.headquarters}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {company.regions.map(item => (
                  <span key={item} className="rounded-full border border-white/10 bg-slate-900 px-2.5 py-1 text-[11px] text-slate-300">{item}</span>
                ))}
              </div>
              <a
                href={company.website}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 px-4 py-2.5 text-sm font-semibold text-amber-300 hover:bg-amber-500/10"
              >
                Official company website <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </article>
          ))}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <h3 className="font-bold text-white">Review available GoldVaults investments</h3>
          <p className="mt-1 text-sm text-slate-300">See the investment products actually available to your account. Availability varies and no return is guaranteed.</p>
          <Link href="/dashboard/investments" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-300">
            Open investments <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
          <h3 className="font-bold text-white">Mining company partnership enquiries</h3>
          <p className="mt-1 text-sm text-slate-300">Companies can contact GoldVaults for due diligence and commercial discussions. Listing is never automatic.</p>
          <Link href="/contact?topic=mining-partnership" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-blue-300">
            Contact partnerships <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
