/**
 * useGoldVaults — central hook providing tRPC-backed data and mutations
 * for all GoldVaults features. Components import from here instead of
 * calling trpc directly, keeping the data layer in one place.
 */
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

// ─── Auth & Profile ───────────────────────────────────────────────────────────
export function useProfile() {
  return trpc.user.profile.useQuery(undefined, { retry: false });
}

export function useUpdateProfile() {
  const utils = trpc.useUtils();
  return trpc.user.updateProfile.useMutation({
    onSuccess: () => {
      utils.user.profile.invalidate();
      toast.success("Profile updated!");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useLeaderboard(limit = 20) {
  return trpc.user.leaderboard.useQuery({ limit });
}

// ─── Wallets ──────────────────────────────────────────────────────────────────
export function useWallets() {
  return trpc.wallet.list.useQuery(undefined, { retry: false });
}

export function useGoldCoins() {
  return trpc.wallet.goldCoins.useQuery(undefined, { retry: false });
}

// ─── Transactions ─────────────────────────────────────────────────────────────
export function useTransactions(limit = 50) {
  return trpc.transaction.list.useQuery({ limit }, { retry: false });
}

export function useSendBtc() {
  const utils = trpc.useUtils();
  return trpc.transaction.sendBtc.useMutation({
    onSuccess: (data) => {
      utils.transaction.list.invalidate();
      utils.wallet.list.invalidate();
      toast.success(`BTC sent! TX: ${data.txHash.slice(0, 12)}...`);
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useSendGoldCoins() {
  const utils = trpc.useUtils();
  return trpc.transaction.sendGoldCoins.useMutation({
    onSuccess: () => {
      utils.wallet.goldCoins.invalidate();
      utils.transaction.list.invalidate();
      toast.success("GoldCoins sent successfully!");
    },
    onError: (e) => toast.error(e.message),
  });
}

// ─── Address Book ─────────────────────────────────────────────────────────────
export function useAddressBook() {
  return trpc.addressBook.list.useQuery(undefined, { retry: false });
}

export function useCreateAddress() {
  const utils = trpc.useUtils();
  return trpc.addressBook.create.useMutation({
    onSuccess: () => {
      utils.addressBook.list.invalidate();
      toast.success("Address saved to book!");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useUpdateAddress() {
  const utils = trpc.useUtils();
  return trpc.addressBook.update.useMutation({
    onSuccess: () => utils.addressBook.list.invalidate(),
    onError: (e) => toast.error(e.message),
  });
}

export function useDeleteAddress() {
  const utils = trpc.useUtils();
  return trpc.addressBook.delete.useMutation({
    onSuccess: () => {
      utils.addressBook.list.invalidate();
      toast.success("Address removed");
    },
    onError: (e) => toast.error(e.message),
  });
}

// ─── Notifications ────────────────────────────────────────────────────────────
export function useNotifications(limit = 50) {
  return trpc.notification.list.useQuery({ limit }, {
    refetchInterval: 30_000, // poll every 30s for new notifications
    retry: false,
  });
}

export function useMarkNotificationRead() {
  const utils = trpc.useUtils();
  return trpc.notification.markRead.useMutation({
    onSuccess: () => utils.notification.list.invalidate(),
  });
}

export function useMarkAllNotificationsRead() {
  const utils = trpc.useUtils();
  return trpc.notification.markAllRead.useMutation({
    onSuccess: () => utils.notification.list.invalidate(),
  });
}

export function useClearAllNotifications() {
  const utils = trpc.useUtils();
  return trpc.notification.clearAll.useMutation({
    onSuccess: () => utils.notification.list.invalidate(),
  });
}

// ─── Challenges ───────────────────────────────────────────────────────────────
export function useChallenges() {
  return trpc.challenge.list.useQuery();
}

export function useMyChallengeProgress() {
  return trpc.challenge.myProgress.useQuery(undefined, { retry: false });
}

export function useClaimChallenge() {
  const utils = trpc.useUtils();
  return trpc.challenge.claim.useMutation({
    onSuccess: (data) => {
      utils.challenge.myProgress.invalidate();
      utils.wallet.goldCoins.invalidate();
      toast.success(`Claimed ${data.reward} GoldCoins! New balance: ${data.newBalance}`);
    },
    onError: (e) => toast.error(e.message),
  });
}

// ─── Social ───────────────────────────────────────────────────────────────────
export function useCommunityFeed(limit = 30) {
  return trpc.social.feed.useQuery({ limit }, { refetchInterval: 60_000 });
}

export function useSocialContacts(enabled = true) {
  return trpc.social.contacts.useQuery(
    { limit: 50 },
    { enabled, refetchInterval: 15_000, retry: false },
  );
}

export function useChatHistory(otherUserId?: number) {
  return trpc.social.history.useQuery(
    { otherUserId: otherUserId ?? 0, limit: 100 },
    { enabled: Boolean(otherUserId), refetchInterval: 5_000, retry: false },
  );
}

export function useCreatePost() {
  const utils = trpc.useUtils();
  return trpc.social.post.useMutation({
    onSuccess: (data) => {
      utils.social.feed.invalidate();
      utils.wallet.goldCoins.invalidate();
      toast.success(`Post shared! +${data.coinsEarned} GoldCoins earned`);
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useSendMessage() {
  const utils = trpc.useUtils();
  return trpc.social.sendMessage.useMutation({
    onSuccess: async (_data, input) => {
      await Promise.all([
        utils.social.history.invalidate({ otherUserId: input.toUserId, limit: 100 }),
        utils.social.contacts.invalidate(),
      ]);
    },
    onError: (e) => toast.error(e.message),
  });
}

// ─── Minting ──────────────────────────────────────────────────────────────────
export function useMintingHistory() {
  return trpc.minting.history.useQuery(undefined, { retry: false });
}

export function useMintGold() {
  const utils = trpc.useUtils();
  return trpc.minting.mint.useMutation({
    onSuccess: (data) => {
      utils.minting.history.invalidate();
      utils.wallet.goldCoins.invalidate();
      toast.success(`Minting started! TX: ${data.txHash}`);
    },
    onError: (e) => toast.error(e.message),
  });
}

// ─── NFC Cards ────────────────────────────────────────────────────────────────
export function useNfcCards() {
  return trpc.nfcCard.list.useQuery(undefined, { retry: false });
}

export function useCreateNfcCard() {
  const utils = trpc.useUtils();
  return trpc.nfcCard.create.useMutation({
    onSuccess: (data) => {
      utils.nfcCard.list.invalidate();
      toast.success(`Card created: ${data.cardNumber}`);
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useToggleCardFreeze() {
  const utils = trpc.useUtils();
  return trpc.nfcCard.toggleFreeze.useMutation({
    onSuccess: (_, vars) => {
      utils.nfcCard.list.invalidate();
      toast.success(vars.frozen ? "Card frozen" : "Card unfrozen");
    },
    onError: (e) => toast.error(e.message),
  });
}

// ─── Price Alerts ─────────────────────────────────────────────────────────────
export function usePriceAlerts() {
  return trpc.priceAlert.list.useQuery(undefined, { retry: false });
}

export function useCreatePriceAlert() {
  const utils = trpc.useUtils();
  return trpc.priceAlert.create.useMutation({
    onSuccess: () => {
      utils.priceAlert.list.invalidate();
      toast.success("Price alert set!");
    },
    onError: (e) => toast.error(e.message),
  });
}

export function useDeletePriceAlert() {
  const utils = trpc.useUtils();
  return trpc.priceAlert.delete.useMutation({
    onSuccess: () => {
      utils.priceAlert.list.invalidate();
      toast.success("Alert removed");
    },
    onError: (e) => toast.error(e.message),
  });
}
