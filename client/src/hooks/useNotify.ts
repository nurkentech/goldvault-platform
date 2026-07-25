import { useCallback } from "react";
import { useNotifications } from "@/contexts/NotificationContext";

/**
 * Convenience hook that exposes typed notification helpers for
 * specific GoldVaults events. Import this in any component that
 * needs to fire notifications.
 */
export function useNotify() {
  const { notify } = useNotifications();

  const notifyNewMessage = useCallback((senderName: string, preview: string) => {
    notify({
      category: "message",
      title: `New message from ${senderName}`,
      body: preview,
      icon: "💬",
      actionLabel: "Reply",
      actionTab: "social",
    });
  }, [notify]);

  const notifyChallengeComplete = useCallback((challengeName: string, reward: number) => {
    notify({
      category: "challenge",
      title: "Challenge Complete! 🎯",
      body: `You completed "${challengeName}" and earned ${reward} GoldCoins!`,
      icon: "🎯",
      actionLabel: "Claim Reward",
      actionTab: "challenges",
    });
  }, [notify]);

  const notifyChallengeClaimed = useCallback((reward: number) => {
    notify({
      category: "challenge",
      title: "GoldCoins Claimed! 🪙",
      body: `+${reward} GoldCoins have been added to your balance.`,
      icon: "🪙",
      actionLabel: "View Challenges",
      actionTab: "challenges",
    });
  }, [notify]);

  const notifyPriceAlert = useCallback((asset: string, change: string, price: string) => {
    notify({
      category: "price",
      title: `${asset} Price Alert`,
      body: `${asset} is ${change} — now at ${price}`,
      icon: "📈",
      actionLabel: "View Exchange",
      actionTab: "exchange",
    });
  }, [notify]);

  const notifyMintSuccess = useCallback((barName: string, weight: string) => {
    notify({
      category: "minting",
      title: "Gold Bar Minted! 🏅",
      body: `Your ${barName} (${weight}) has been minted and recorded on the blockchain.`,
      icon: "🏅",
      actionLabel: "View Bars",
      actionTab: "minting",
    });
  }, [notify]);

  const notifyMintReady = useCallback((barName: string) => {
    notify({
      category: "minting",
      title: "Ready to Mint!",
      body: `You have enough GoldCoins to mint a ${barName}. Tap to mint now.`,
      icon: "⛏️",
      actionLabel: "Mint Now",
      actionTab: "minting",
    });
  }, [notify]);

  const notifyFriendActivity = useCallback((friendName: string, activity: string) => {
    notify({
      category: "social",
      title: friendName,
      body: activity,
      icon: "👥",
      actionLabel: "View Social",
      actionTab: "social",
    });
  }, [notify]);

  const notifyShared = useCallback((platform: string) => {
    notify({
      category: "social",
      title: "Portfolio Shared! 🚀",
      body: `Your investment journey was shared to ${platform}. You earned +25 GoldCoins!`,
      icon: "📲",
      actionLabel: "View Social",
      actionTab: "social",
    });
  }, [notify]);

  const notifySystem = useCallback((title: string, body: string) => {
    notify({
      category: "system",
      title,
      body,
      icon: "🔒",
    });
  }, [notify]);

  return {
    notifyNewMessage,
    notifyChallengeComplete,
    notifyChallengeClaimed,
    notifyPriceAlert,
    notifyMintSuccess,
    notifyMintReady,
    notifyFriendActivity,
    notifyShared,
    notifySystem,
  };
}
