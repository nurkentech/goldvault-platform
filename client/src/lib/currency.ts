import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { normalizeCurrency, PreferredCurrency } from "@/lib/preferences";

export type { PreferredCurrency } from "@/lib/preferences";

export function useCurrency() {
  const { user } = useAuth();
  const currency: PreferredCurrency = normalizeCurrency(user?.preferredCurrency);
  const { data } = trpc.market.fiatRates.useQuery(undefined, { staleTime: 60 * 60 * 1000 });
  const rate = data?.rates[currency] ?? 1;
  return {
    currency,
    rate,
    formatUsd(value: number, options?: Intl.NumberFormatOptions) {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "NGN" ? 0 : 2,
        maximumFractionDigits: 2,
        ...options,
      }).format(value * rate);
    },
  };
}
