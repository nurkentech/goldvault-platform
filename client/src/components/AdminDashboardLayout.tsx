import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import {
  LayoutDashboard, Users, ArrowLeftRight, Wallet,
  Megaphone, Settings, LogOut, ChevronLeft, ChevronRight,
  Bell, Search, Menu, X, TrendingUp,
  AlertTriangle, ShieldCheck, KeyRound, Scale, Bot,
  PanelsTopLeft,
  Newspaper,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/admin" },
  { label: "Users & KYC", icon: Users, path: "/admin/users" },
  { label: "Transactions", icon: ArrowLeftRight, path: "/admin/transactions" },
  { label: "Deposits & Withdrawals", icon: Wallet, path: "/admin/deposits-withdrawals" },
  { label: "Investments", icon: TrendingUp, path: "/admin/investments" },
  { label: "Announcements", icon: Megaphone, path: "/admin/announcements" },
  { label: "Website Content", icon: PanelsTopLeft, path: "/admin/content" },
  { label: "News & Blog", icon: Newspaper, path: "/admin/blog" },
  { label: "Platform Settings", icon: Settings, path: "/admin/settings" },
  { label: "Compliance & Operations", icon: Scale, path: "/admin/operations" },
  { label: "AI Review Copilot", icon: Bot, path: "/admin/ai-copilot" },
  { label: "Account", icon: KeyRound, path: "/admin/account" },
];

function AdminSkeleton() {
  return (
    <div className="flex h-screen bg-[#0a0e1a]">
      <div className="w-64 bg-[#0d1321] border-r border-gray-800 p-4 space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-10 bg-gray-800/50 rounded-lg animate-pulse" />
        ))}
      </div>
      <div className="flex-1 p-6 space-y-6">
        <div className="h-12 bg-gray-800/50 rounded-lg animate-pulse w-1/3" />
        <div className="grid grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 bg-gray-800/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-gray-800/50 rounded-xl animate-pulse" />
      </div>
    </div>
  );
}

function LogoutButton({ collapsed }: { collapsed: boolean }) {
  const [, navigate] = useLocation();
  const logoutMutation = trpc.adminAuth.logout.useMutation({
    onSuccess: () => { navigate("/admin/login"); },
  });
  return (
    <button
      onClick={() => logoutMutation.mutate()}
      disabled={logoutMutation.isPending}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 cursor-pointer transition-colors w-full"
    >
      <LogOut className="w-5 h-5 flex-shrink-0" />
      {!collapsed && <span className="text-sm font-medium">{logoutMutation.isPending ? "Logging out..." : "Logout"}</span>}
    </button>
  );
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check admin session
  const {
    data: adminUser,
    isLoading,
    isFetching,
  } = trpc.adminAuth.me.useQuery(undefined, {
    retry: false,
    refetchOnMount: "always",
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isFetching && !adminUser) {
      navigate("/admin/login");
    }
  }, [isFetching, isLoading, adminUser, navigate]);

  // Keep rendering an already authenticated admin while React Query performs
  // a background session refresh during navigation between admin pages.
  if ((isLoading || isFetching) && !adminUser) return <AdminSkeleton />;
  if (!adminUser) return <AdminSkeleton />;

  return (
    <div className="flex h-screen bg-[#0a0e1a] text-white overflow-hidden">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        ${collapsed ? "w-20" : "w-64"} 
        ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        bg-[#0d1321] border-r border-gray-800/60
        flex flex-col transition-all duration-300 ease-out
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800/60">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-black" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">GoldVaults</h1>
                <p className="text-[10px] text-amber-400 font-medium">ADMIN PANEL</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-7 h-7 items-center justify-center rounded-md hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-800 text-gray-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.path || (item.path !== "/admin" && location.startsWith(item.path));
            return (
              <Link key={item.path} href={item.path}>
                <div className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200
                  ${isActive
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                    : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                  }
                `}>
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? "text-amber-400" : ""}`} />
                  {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-800/60">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800/50 cursor-pointer transition-colors">
              <ArrowLeftRight className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span className="text-sm font-medium">User Dashboard</span>}
            </div>
          </Link>
          <LogoutButton collapsed={collapsed} />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-[#0d1321]/80 backdrop-blur-sm border-b border-gray-800/60 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search users, transactions..."
                className="w-72 h-9 pl-10 pr-4 bg-gray-800/50 border border-gray-700/50 rounded-lg text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 pl-3 border-l border-gray-800">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-black">{adminUser.username[0]?.toUpperCase() ?? "A"}</span>
              </div>
              {!collapsed && (
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-white">{adminUser.username}</p>
                  <p className="text-[10px] text-amber-400">Super Admin</p>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#080c16]">
          {children}
        </main>
      </div>
    </div>
  );
}
