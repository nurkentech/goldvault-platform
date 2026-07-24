/**
 * Notifications — All user notifications with mark-read and filtering
 */
import { useState } from "react";
import UserDashboardLayout from "@/components/UserDashboardLayout";
import { trpc } from "@/lib/trpc";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Trash2, Filter } from "lucide-react";
import { toast } from "sonner";

const typeIcons: Record<string, string> = {
  transaction: "💸",
  security: "🔒",
  promotion: "🎁",
  system: "⚙️",
  challenge: "🏆",
  price_alert: "📈",
};

export default function Notifications() {
  return (
    <UserDashboardLayout>
      <NotificationsContent />
    </UserDashboardLayout>
  );
}

function NotificationsContent() {
  const [filter, setFilter] = useState("all");
  const { data: notifications, isLoading } = trpc.notification.list.useQuery({ limit: 50 });
  const markRead = trpc.notification.markRead.useMutation({
    onSuccess: () => toast.success("Marked as read"),
  });
  const markAllRead = trpc.notification.markAllRead.useMutation({
    onSuccess: () => toast.success("All notifications marked as read"),
  });

  const filters = ["all", "transaction", "security", "promotion", "system", "challenge"];

  const filteredNotifs = notifications?.filter(n => {
    if (filter === "all") return true;
    return n.type === filter;
  }) ?? [];

  const unreadCount = notifications?.filter(n => !n.isRead).length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            Notifications
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 text-xs bg-amber-500 text-black rounded-full font-semibold">{unreadCount}</span>
            )}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">Stay updated on your account activity</p>
        </div>
        <button
          onClick={() => markAllRead.mutate()}
          disabled={markAllRead.isPending || unreadCount === 0}
          className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors disabled:opacity-50"
        >
          <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filter === f ? "bg-amber-500 text-black" : "bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notification List */}
      <div className="space-y-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card/50 border border-white/5 rounded-xl p-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-white/5 rounded w-1/3" />
                  <div className="h-3 bg-white/5 rounded w-2/3" />
                </div>
              </div>
            </div>
          ))
        ) : filteredNotifs.length === 0 ? (
          <div className="bg-card/50 border border-white/5 rounded-2xl p-12 text-center">
            <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          filteredNotifs.map((notif, i) => (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className={`bg-card/50 border rounded-xl p-4 transition-colors cursor-pointer ${
                notif.isRead ? "border-white/5 hover:border-white/10" : "border-amber-500/20 bg-amber-500/[0.02] hover:bg-amber-500/[0.04]"
              }`}
              onClick={() => {
                if (!notif.isRead) markRead.mutate({ id: notif.id });
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-lg shrink-0">
                  {typeIcons[notif.type] || "📌"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-xs font-semibold ${notif.isRead ? "text-foreground/70" : "text-foreground"}`}>{notif.title}</p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                      {new Date(notif.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                </div>
                {!notif.isRead && <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
