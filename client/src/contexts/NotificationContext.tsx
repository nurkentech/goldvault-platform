import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from "react";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────
export type NotificationCategory = "message" | "challenge" | "price" | "social" | "minting" | "system";

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  body: string;
  icon: string;
  timestamp: Date;
  read: boolean;
  actionLabel?: string;
  actionTab?: string;   // which tab to navigate to on click
}

interface NotificationContextValue {
  notifications: AppNotification[];
  unreadCount: number;
  pushPermission: NotificationPermission | "unsupported";
  requestPushPermission: () => Promise<void>;
  addNotification: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clearAll: () => void;
  /** Fire a toast AND add to bell AND (if granted) send a browser push */
  notify: (n: Omit<AppNotification, "id" | "timestamp" | "read">) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const NotificationContext = createContext<NotificationContextValue | null>(null);

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

// ─── Seed Data ────────────────────────────────────────────────────────────────
const SEED: AppNotification[] = [
  {
    id: "seed-1",
    category: "message",
    title: "New message from Alex Chen",
    body: "Just bought 2oz of gold! 🥇",
    icon: "💬",
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    read: false,
    actionLabel: "Reply",
    actionTab: "social",
  },
  {
    id: "seed-2",
    category: "challenge",
    title: "Daily Challenge Reset",
    body: "4 new challenges are waiting for you. Earn up to 250 GoldCoins today!",
    icon: "🎯",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    actionLabel: "View Challenges",
    actionTab: "challenges",
  },
  {
    id: "seed-3",
    category: "price",
    title: "Gold Price Alert 📈",
    body: "Gold (XAU) is up +2.3% today — now at $2,387/oz",
    icon: "📈",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    read: false,
    actionLabel: "View Exchange",
    actionTab: "exchange",
  },
  {
    id: "seed-4",
    category: "social",
    title: "Sofia Rossi completed a challenge",
    body: "Your friend earned 200 GoldCoins from the Weekly Challenge 🏆",
    icon: "👥",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    actionLabel: "View Social",
    actionTab: "social",
  },
  {
    id: "seed-5",
    category: "minting",
    title: "Minting Available!",
    body: "You have enough GoldCoins to mint a Micro Bar. Tap to mint now.",
    icon: "🏅",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000),
    read: true,
    actionLabel: "Mint Now",
    actionTab: "minting",
  },
  {
    id: "seed-6",
    category: "system",
    title: "Security Update",
    body: "Your account was accessed from a new device. Verify it's you.",
    icon: "🔒",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
  },
];

// ─── Provider ─────────────────────────────────────────────────────────────────
export function NotificationProvider({ children, onNavigate }: { children: ReactNode; onNavigate?: (tab: string) => void }) {
  const [notifications, setNotifications] = useState<AppNotification[]>(SEED);
  const [pushPermission, setPushPermission] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );
  const onNavigateRef = useRef(onNavigate);
  useEffect(() => { onNavigateRef.current = onNavigate; }, [onNavigate]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = useCallback((n: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    const full: AppNotification = {
      ...n,
      id: `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      timestamp: new Date(),
      read: false,
    };
    setNotifications(prev => [full, ...prev]);
  }, []);

  const requestPushPermission = useCallback(async () => {
    if (typeof Notification === "undefined") return;
    const result = await Notification.requestPermission();
    setPushPermission(result);
  }, []);

  const sendBrowserPush = useCallback((n: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    if (typeof Notification === "undefined" || Notification.permission !== "granted") return;
    try {
      new Notification(`GoldVaults.us — ${n.title}`, {
        body: n.body,
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: n.category,
      });
    } catch {
      // Silently fail if push is blocked
    }
  }, []);

  const notify = useCallback((n: Omit<AppNotification, "id" | "timestamp" | "read">) => {
    // 1. Add to bell
    addNotification(n);

    // 2. Toast
    const toastFn =
      n.category === "price" ? toast.info :
      n.category === "challenge" ? toast.success :
      n.category === "minting" ? toast.success :
      n.category === "message" ? toast.message :
      toast.message;

    toastFn(`${n.icon} ${n.title}`, {
      description: n.body,
      duration: 5000,
      action: n.actionLabel && n.actionTab ? {
        label: n.actionLabel,
        onClick: () => onNavigateRef.current?.(n.actionTab!),
      } : undefined,
    });

    // 3. Browser push
    sendBrowserPush(n);
  }, [addNotification, sendBrowserPush]);

  const markRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // ── Simulate live events ──────────────────────────────────────────────────
  useEffect(() => {
    const events: Array<{ delay: number; n: Omit<AppNotification, "id" | "timestamp" | "read"> }> = [
      {
        delay: 20000,
        n: { category: "message", title: "Maria Santos", body: "Check out my mining portfolio 📊", icon: "💬", actionLabel: "Reply", actionTab: "social" },
      },
      {
        delay: 45000,
        n: { category: "price", title: "Bitcoin Alert 🚀", body: "BTC crossed $70,000 — your crypto holdings are up!", icon: "📈", actionLabel: "View Wallet", actionTab: "wallet" },
      },
      {
        delay: 75000,
        n: { category: "challenge", title: "Challenge Progress!", body: "You're 70% done with 'Trading Master' — 3 more trades to go!", icon: "🎯", actionLabel: "View Challenges", actionTab: "challenges" },
      },
      {
        delay: 110000,
        n: { category: "social", title: "James Wright liked your post", body: "Your gold portfolio update got a reaction 🔥", icon: "❤️", actionLabel: "View Social", actionTab: "social" },
      },
    ];

    const timers = events.map(({ delay, n }) => setTimeout(() => notify(n), delay));
    return () => timers.forEach(clearTimeout);
  }, [notify]);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, pushPermission, requestPushPermission, addNotification, markRead, markAllRead, clearAll, notify }}>
      {children}
    </NotificationContext.Provider>
  );
}
