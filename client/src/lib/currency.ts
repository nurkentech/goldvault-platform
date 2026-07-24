import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export type PreferredCurrency = "USD" | "EUR" | "GBP" | "NGN";

export function useCurrency() {
  const { user } = useAuth();
  const currency = (user?.preferredCurrency ?? "USD") as PreferredCurrency;
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
