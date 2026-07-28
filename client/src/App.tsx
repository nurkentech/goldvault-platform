import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import BuyGold from "./pages/BuyGold";
import Markets from "./pages/Markets";
import About from "./pages/About";
import {
  HowItWorksPage,
  FAQPage,
  SecurityPage,
  GVTTokenPage,
  VaultStoragePage,
  PhysicalDeliveryPage,
  ExchangePage,
  NFCCardPage,
  GoldCoinsPage,
  MiningPartnersPage,
  VaultAuditsPage,
  BlogPage,
  CareersPage,
  ContactPage,
  GoldVsBitcoinPage,
  ReferralPage,
  GoldPriceAlertsPage,
  SocialHubPage,
  ChallengesPage,
  GoldETFPage,
  BitcoinWalletPage,
  MintPage,
  PrivacyPolicyPage,
  TermsPage,
  CookiePolicyPage,
  RiskDisclosurePage,
} from "./pages/InfoPages";
import Trade from "./pages/Trade";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";

// Dashboard sub-pages
import Wallets from "./pages/dashboard/Wallets";
import Deposit from "./pages/dashboard/Deposit";
import Withdraw from "./pages/dashboard/Withdraw";
import DashboardExchange from "./pages/dashboard/Exchange";
import Investments from "./pages/dashboard/Investments";
import Transactions from "./pages/dashboard/Transactions";
import Referral from "./pages/dashboard/Referral";
import Rewards from "./pages/dashboard/Rewards";
import Cards from "./pages/dashboard/Cards";
import Support from "./pages/dashboard/Support";
import DashboardSecurity from "./pages/dashboard/Security";
import Settings from "./pages/dashboard/Settings";
import DashboardNotifications from "./pages/dashboard/Notifications";
import KycVerification from "./pages/dashboard/KycVerification";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminTransactions from "./pages/admin/AdminTransactions";
import AdminInvestments from "./pages/admin/AdminInvestments";
import AdminDepositsWithdrawals from "./pages/admin/AdminDepositsWithdrawals";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAccount from "./pages/admin/AdminAccount";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboardLayout from "./components/AdminDashboardLayout";
import SeoManager from "./components/SeoManager";
import ReferralLanding from "./pages/ReferralLanding";
import { I18nProvider } from "./contexts/I18nContext";
import P2PMarketplace from "./pages/dashboard/P2PMarketplace";
import WealthHub from "./pages/dashboard/WealthHub";
import DeveloperPartner from "./pages/dashboard/DeveloperPartner";
import { KnowledgeArticle, KnowledgeBase } from "./pages/KnowledgeBase";
import AdminOperations from "./pages/admin/AdminOperations";
import AccessibilityManager from "./components/AccessibilityManager";
import LanguageSwitcher from "./components/LanguageSwitcher";
import VerifyTwoFactor from "./pages/VerifyTwoFactor";
import AICopilot from "./pages/dashboard/AICopilot";
import AdminAICopilot from "./pages/admin/AdminAICopilot";
import AdminContent from "./pages/admin/AdminContent";
import ManagedPage from "./pages/ManagedPage";
import Analytics from "./components/Analytics";

// Admin wrapper to apply layout
function AdminPage({ component: Component }: { component: React.ComponentType }) {
  return <AdminDashboardLayout><ErrorBoundary name="admin-page" compact><Component /></ErrorBoundary></AdminDashboardLayout>;
}

function Router() {
  return (
    <Switch>
      {/* Main */}
      <Route path="/" component={Home} />

      {/* Gold Products */}
      <Route path="/buy-gold" component={BuyGold} />
      <Route path="/gvt-token" component={GVTTokenPage} />
      <Route path="/vault-storage" component={VaultStoragePage} />
      <Route path="/physical-delivery" component={PhysicalDeliveryPage} />
      <Route path="/gold-price-alerts" component={GoldPriceAlertsPage} />

      {/* Crypto Services */}
      <Route path="/exchange" component={ExchangePage} />
      <Route path="/markets" component={Markets} />
      <Route path="/nfc-card" component={NFCCardPage} />
      <Route path="/goldcoins" component={GoldCoinsPage} />
      <Route path="/referral" component={ReferralPage} />
      <Route path="/ref/:code" component={ReferralLanding} />

      {/* Company */}
      <Route path="/about" component={About} />
      <Route path="/mining-partners" component={MiningPartnersPage} />
      <Route path="/vault-audits" component={VaultAuditsPage} />
      <Route path="/security" component={SecurityPage} />
      <Route path="/careers" component={CareersPage} />
      <Route path="/contact" component={ContactPage} />

      {/* Learn */}
      <Route path="/how-it-works" component={HowItWorksPage} />
      <Route path="/faq" component={FAQPage} />
      <Route path="/blog/:slug" component={KnowledgeArticle} />
      <Route path="/blog" component={KnowledgeBase} />
      <Route path="/gold-vs-bitcoin" component={GoldVsBitcoinPage} />

      {/* Platform Features */}
      <Route path="/trade" component={Trade} />
      <Route path="/social" component={SocialHubPage} />
      <Route path="/challenges" component={ChallengesPage} />
      <Route path="/gold-etf" component={GoldETFPage} />
      <Route path="/bitcoin-wallet" component={BitcoinWalletPage} />
      <Route path="/mint" component={MintPage} />

      {/* User Profile */}
      <Route path="/profile" component={Profile} />
      <Route path="/verify-2fa" component={VerifyTwoFactor} />

      {/* User Dashboard */}
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/dashboard/wallets" component={Wallets} />
      <Route path="/dashboard/deposit" component={Deposit} />
      <Route path="/dashboard/withdraw" component={Withdraw} />
      <Route path="/dashboard/exchange" component={DashboardExchange} />
      <Route path="/dashboard/investments" component={Investments} />
      <Route path="/dashboard/copilot" component={AICopilot} />
      <Route path="/dashboard/p2p" component={P2PMarketplace} />
      <Route path="/dashboard/wealth" component={WealthHub} />
      <Route path="/dashboard/transactions" component={Transactions} />
      <Route path="/dashboard/referral" component={Referral} />
      <Route path="/dashboard/rewards" component={Rewards} />
      <Route path="/dashboard/cards" component={Cards} />
      <Route path="/dashboard/support" component={Support} />
      <Route path="/dashboard/developer" component={DeveloperPartner} />
      <Route path="/dashboard/security" component={DashboardSecurity} />
      <Route path="/dashboard/settings" component={Settings} />
      <Route path="/dashboard/notifications" component={DashboardNotifications} />
      <Route path="/dashboard/kyc" component={KycVerification} />

      {/* Shortcut routes for sidebar nav */}
      <Route path="/wallet" component={Wallets} />
      <Route path="/deposit" component={Deposit} />
      <Route path="/withdraw" component={Withdraw} />
      <Route path="/investments" component={Investments} />
      <Route path="/transactions" component={Transactions} />
      <Route path="/rewards" component={Rewards} />
      <Route path="/cards" component={Cards} />
      <Route path="/support" component={Support} />
      <Route path="/settings" component={Settings} />
      <Route path="/notifications" component={DashboardNotifications} />

      {/* Admin Dashboard */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">{() => <AdminPage component={AdminDashboard} />}</Route>
      <Route path="/admin/users">{() => <AdminPage component={AdminUsers} />}</Route>
      <Route path="/admin/transactions">{() => <AdminPage component={AdminTransactions} />}</Route>
      <Route path="/admin/investments">{() => <AdminPage component={AdminInvestments} />}</Route>
      <Route path="/admin/deposits-withdrawals">{() => <AdminPage component={AdminDepositsWithdrawals} />}</Route>
      <Route path="/admin/announcements">{() => <AdminPage component={AdminAnnouncements} />}</Route>
      <Route path="/admin/settings">{() => <AdminPage component={AdminSettings} />}</Route>
      <Route path="/admin/content">{() => <AdminPage component={AdminContent} />}</Route>
      <Route path="/admin/account">{() => <AdminPage component={AdminAccount} />}</Route>
      <Route path="/admin/operations">{() => <AdminPage component={AdminOperations} />}</Route>
      <Route path="/admin/ai-copilot">{() => <AdminPage component={AdminAICopilot} />}</Route>

      {/* Legal */}
      <Route path="/privacy-policy" component={PrivacyPolicyPage} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/cookie-policy" component={CookiePolicyPage} />
      <Route path="/risk-disclosure" component={RiskDisclosurePage} />

      {/* 404 */}
      <Route path="/404" component={NotFound} />

      {/* Published pages created in the admin CMS. Keep after all reserved routes. */}
      <Route path="/:slug" component={ManagedPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" switchable>
        <I18nProvider><TooltipProvider>
          <SeoManager />
          <Analytics />
          <AccessibilityManager />
          <LanguageSwitcher />
          <Toaster />
          <Router />
        </TooltipProvider></I18nProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
