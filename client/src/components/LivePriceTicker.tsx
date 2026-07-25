import { TrendingDown, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function LivePriceTicker() {
  const { data: prices = [], isLoading, isError } = trpc.market.prices.useQuery(
    undefined,
    { refetchInterval: 30_000 },
  );

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 border-b border-slate-800/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center gap-8 overflow-x-auto pb-2">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="flex-shrink-0 h-8 w-24 bg-slate-700/30 rounded animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-slate-900/50 border-b border-slate-800/50 px-4 py-3 text-center text-xs text-slate-400">
        Live prices are temporarily unavailable.
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-slate-900/50 via-slate-900/50 to-slate-900/50 border-b border-amber-500/20 backdrop-blur-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-xs font-semibold text-amber-400 whitespace-nowrap uppercase tracking-wider">
            Live Prices
          </span>
          <div className="flex gap-6 flex-1 overflow-x-auto scrollbar-hide">
            {prices.map((asset) => {
              const isPositive = (asset.change24h ?? 0) >= 0;
              return (
                <div
                  key={asset.symbol}
                  className="flex-shrink-0 flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-amber-500/30 transition group"
                >
                  <span className="text-lg">{asset.icon}</span>
                  <div className="min-w-max">
                    <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {asset.symbol}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        ${asset.price.toLocaleString("en-US", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                      {asset.change24h === null ? (
                        <span className="text-xs text-slate-500">24h n/a</span>
                      ) : (
                        <div
                          className={`flex items-center gap-1 text-xs font-semibold ${isPositive ? "text-green-400" : "text-red-400"}`}
                        >
                          {isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span>{Math.abs(asset.change24h).toFixed(2)}%</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
