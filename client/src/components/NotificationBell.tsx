import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, BellRing, Check, CheckCheck, Trash2, Settings, X, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNotifications, NotificationCategory, AppNotification } from "@/contexts/NotificationContext";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function timeAgo(date: Date): string {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  message: "Messages",
  challenge: "Challenges",
  price: "Price Alerts",
  social: "Social",
  minting: "Minting",
  system: "System",
};

const CATEGORY_COLORS: Record<NotificationCategory, string> = {
  message: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  challenge: "bg-amber-500/20 text-amber-300 border-amber-500/30",
  price: "bg-green-500/20 text-green-300 border-green-500/30",
  social: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  minting: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  system: "bg-slate-500/20 text-slate-300 border-slate-500/30",
};

const ALL_CATEGORIES: NotificationCategory[] = ["message", "challenge", "price", "social", "minting", "system"];

// ─── Notification Item ────────────────────────────────────────────────────────
function NotifItem({
  notif,
  onRead,
  onNavigate,
}: {
  notif: AppNotification;
  onRead: (id: string) => void;
  onNavigate?: (tab: string) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20, height: 0 }}
      transition={{ duration: 0.2 }}
      className={`group relative flex gap-3 p-3 rounded-xl transition-colors cursor-pointer ${notif.read ? "hover:bg-blue-900/30" : "bg-blue-900/40 hover:bg-blue-900/60"}`}
      onClick={() => {
        onRead(notif.id);
        if (notif.actionTab) onNavigate?.(notif.actionTab);
      }}
    >
      {/* Unread dot */}
      {!notif.read && (
        <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-400" />
      )}

      {/* Icon */}
      <div className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg border ${CATEGORY_COLORS[notif.category]}`}>
        {notif.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-4">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-semibold leading-tight ${notif.read ? "text-slate-300" : "text-white"}`}>
            {notif.title}
          </p>
        </div>
        <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.body}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-xs text-slate-500">{timeAgo(notif.timestamp)}</span>
          {notif.actionLabel && (
            <span className="text-xs text-amber-400 font-medium hover:text-amber-300">
              {notif.actionLabel} →
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NotificationBell({ onNavigate }: { onNavigate?: (tab: string) => void }) {
  const { notifications, unreadCount, pushPermission, requestPushPermission, markRead, markAllRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<NotificationCategory | "all">("all");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const filtered = activeFilter === "all"
    ? notifications
    : notifications.filter(n => n.category === activeFilter);

  const categoryCounts = ALL_CATEGORIES.reduce<Record<string, number>>((acc, cat) => {
    acc[cat] = notifications.filter(n => n.category === cat && !n.read).length;
    return acc;
  }, {});

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        ref={bellRef}
        onClick={() => setOpen(v => !v)}
        className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-700/50 hover:bg-blue-800/60 hover:border-amber-500/40 transition-all"
        aria-label="Notifications"
      >
        <AnimatePresence mode="wait">
          {unreadCount > 0 ? (
            <motion.div
              key="ring"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1, rotate: [0, -15, 15, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
            >
              <BellRing className="w-5 h-5 text-amber-400" />
            </motion.div>
          ) : (
            <motion.div key="bell" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
              <Bell className="w-5 h-5 text-slate-300" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Badge */}
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-amber-500 rounded-full flex items-center justify-center px-1 shadow-lg shadow-amber-500/40"
          >
            <span className="text-white text-[10px] font-bold leading-none">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          </motion.div>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="absolute right-0 top-12 w-96 max-h-[600px] flex flex-col bg-blue-950 border border-blue-800/70 rounded-2xl shadow-2xl shadow-black/50 z-[100] overflow-hidden"
            style={{ transformOrigin: "top right" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-blue-800/50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-amber-400" />
                <span className="text-white font-semibold text-sm">Notifications</span>
                {unreadCount > 0 && (
                  <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs px-1.5 py-0">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setSoundEnabled(v => !v)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-800/50 transition"
                  title={soundEnabled ? "Mute notifications" : "Unmute notifications"}
                >
                  {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={() => setShowSettings(v => !v)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-800/50 transition"
                  title="Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-blue-800/50 transition"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Settings Panel */}
            <AnimatePresence>
              {showSettings && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden border-b border-blue-800/50 flex-shrink-0"
                >
                  <div className="px-4 py-3 space-y-3">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Notification Settings</p>
                    {/* Push permission */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white">Browser Push Notifications</p>
                        <p className="text-xs text-slate-400">Get alerts even when the tab is in background</p>
                      </div>
                      {pushPermission === "unsupported" ? (
                        <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30 text-xs">Not supported</Badge>
                      ) : pushPermission === "granted" ? (
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">✓ Enabled</Badge>
                      ) : pushPermission === "denied" ? (
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">Blocked</Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={requestPushPermission}
                          className="h-7 text-xs bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                        >
                          Enable
                        </Button>
                      )}
                    </div>
                    {/* Category toggles */}
                    <div>
                      <p className="text-xs text-slate-500 mb-2">Active categories</p>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_CATEGORIES.map(cat => (
                          <span key={cat} className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[cat]}`}>
                            {CATEGORY_LABELS[cat]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Category Filter Tabs */}
            <div className="flex gap-1 px-3 py-2 border-b border-blue-800/50 overflow-x-auto flex-shrink-0 scrollbar-none">
              <button
                onClick={() => setActiveFilter("all")}
                className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-lg transition-all ${activeFilter === "all" ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" : "text-slate-400 hover:text-white hover:bg-blue-800/40"}`}
              >
                All {unreadCount > 0 && <span className="ml-1 text-amber-400 font-bold">{unreadCount}</span>}
              </button>
              {ALL_CATEGORIES.filter(cat => notifications.some(n => n.category === cat)).map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveFilter(cat)}
                  className={`flex-shrink-0 text-xs px-2.5 py-1 rounded-lg transition-all ${activeFilter === cat ? `border ${CATEGORY_COLORS[cat]}` : "text-slate-400 hover:text-white hover:bg-blue-800/40"}`}
                >
                  {CATEGORY_LABELS[cat]}
                  {categoryCounts[cat] > 0 && (
                    <span className="ml-1 text-amber-400 font-bold">{categoryCounts[cat]}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 min-h-0">
              <AnimatePresence initial={false}>
                {filtered.length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <div className="text-4xl mb-3">🔔</div>
                    <p className="text-slate-400 text-sm">No notifications here</p>
                    <p className="text-slate-500 text-xs mt-1">You're all caught up!</p>
                  </motion.div>
                ) : (
                  filtered.map(n => (
                    <NotifItem
                      key={n.id}
                      notif={n}
                      onRead={markRead}
                      onNavigate={(tab) => { onNavigate?.(tab); setOpen(false); }}
                    />
                  ))
                )}
              </AnimatePresence>
            </div>

            {/* Footer Actions */}
            {notifications.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-blue-800/50 flex-shrink-0">
                <button
                  onClick={markAllRead}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-400 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
