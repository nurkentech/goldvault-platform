# GoldVaults.us — TODO

## Pages to Create
- [x] /buy-gold — Buy Physical Gold with Crypto page
- [x] /mint — Mint Gold Bars (accessible via /?tab=mint on homepage dashboard)
- [x] /gold-etf — Gold ETF Wallet (accessible via homepage dashboard)
- [x] /gvt-token — GVT Token page
- [x] /vault-storage — Vault Storage page
- [x] /physical-delivery — Physical Delivery page
- [x] /gold-price-alerts — Gold Price Alerts page
- [x] /bitcoin-wallet — Bitcoin Wallet (accessible via homepage dashboard)
- [x] /exchange — Crypto Exchange page
- [x] /nfc-card — NFC Debit Card page
- [x] /goldcoins — GoldCoins Rewards page
- [x] /challenges — Game Challenges (accessible via homepage dashboard)
- [x] /social — Social Hub (accessible via homepage dashboard)
- [x] /referral — Referral Program page
- [x] /about — About GoldVaults page
- [x] /mining-partners — Mining Partners page
- [x] /vault-audits — Vault Audits page
- [x] /blog — Blog page
- [x] /careers — Careers page
- [x] /contact — Contact Us page
- [x] /how-it-works — How It Works page
- [x] /gold-vs-bitcoin — Gold vs Bitcoin page
- [x] /faq — FAQ page
- [x] /security — Security page
- [x] /markets — Markets page
- [x] /trade — Trade page (dedicated full-screen trading view)

## Hero Background
- [x] Generate and apply hero background image (gold bars + blockchain aesthetic)

## Navigation
- [x] Update all nav links to use wouter Link (real routing)
- [x] Update all footer links to use wouter Link
- [x] Update PremiumNav to use real routes

## Legal Pages & Footer Cleanup
- [x] Create /privacy-policy, /terms, /cookie-policy, /risk-disclosure pages
- [x] Wire footer legal links to real routes
- [x] Update footer social links to real URLs or external destinations
- [x] Create /trade page (dedicated full-screen trading view)

## Trade Page Enhancement
- [x] Upgrade /trade to full-viewport layout with expanded chart, order book, recent trades panel
- [x] Fix duplicate TradePage Vite parse error (removed stale TradePage from InfoPages.tsx)

## Button Activation (Homepage)
- [x] PremiumNav: wire dropdown sub-item onClick handlers to navigate to their href
- [x] PremiumNav: wire "App" download button to show coming-soon toast
- [x] HeroSlider: wire secondary CTA buttons (View Gold Prices, See Gold ETFs, Learn More)
- [x] CryptoCards: wire "View All Markets →" header CTA to /markets
- [x] CryptoCards: wire per-card "Buy" button to open SignUp modal
- [x] CryptoCards: wire per-card "Trade" button to /trade with pair query param
- [x] TradingSection: wire "Convert to Gold" button to open SignUp modal
- [x] TradingSection: wire FeaturedServices tiles to their respective routes
- [x] MarketSections: wire market mover rows to /trade?pair={symbol}
- [x] MarketSections: wire "View All News →" to /blog
- [x] MarketSections: wire news cards and "Read More" to /blog
- [x] MarketSections: wire heatmap tiles to /trade?pair={symbol}
- [x] MarketSections: wire TradingFeatures cards to /trade
- [x] MarketSections: wire SecuritySection "Learn More" to /security
- [x] BottomSections: wire App Store / Google Play buttons to show coming-soon toast
- [x] BottomSections: wire phone mockup Buy/Sell/Send buttons to open SignUp modal

## Auth Flow & User Profile
- [x] Extend users table: avatar, displayName, phone, kycStatus, accountTier, twoFactorEnabled, notifPrefs
- [x] Server: getProfile, updateProfile, updateNotifPrefs, toggle2FA, submitKyc tRPC procedures
- [x] Build /profile page: account details, avatar upload, KYC status badge, account tier
- [x] Build /profile security tab: 2FA toggle, active sessions, change password placeholder
- [x] Build /profile notifications tab: price alerts, portfolio updates, news digest toggles
- [x] Wire Login/Register modal to Manus OAuth and verify full callback flow
- [x] Add protected route guard component (redirect to login if unauthenticated)
- [x] Gate /profile behind auth guard (shows sign-in required state)
- [x] Post-login redirect to /profile after OAuth callback
- [x] Update PremiumNav: show user avatar + dropdown when authenticated, Login/Register when not
- [x] Update PremiumNav user dropdown: Profile, Dashboard, Wallet, Sign Out links

## Personalized Dashboard
- [x] Build /dashboard page: portfolio summary card (total value, gold holdings, crypto holdings, P&L)
- [x] Dashboard: wallet balances grid (BTC, ETH, XAU, GVT, USDT wallets with live prices)
- [x] Dashboard: recent transactions panel (last 10, with type icon, amount, status badge)
- [x] Dashboard: quick actions row (Buy Gold, Trade, Send, Receive, Mint)
- [x] Dashboard: live gold price widget (XAU/USD chart sparkline + 24h change)
- [x] Dashboard: GoldCoins balance + earn CTA
- [x] Dashboard: notifications feed (unread count badge + latest 5)
- [x] Wire /dashboard route in App.tsx (replace Home alias)
- [x] Post-login redirect to /dashboard after OAuth callback
- [x] Gate /dashboard behind auth guard

## Premium Fintech Dashboard Rebuild
- [x] DashboardLayout: sidebar nav with all menu items (Dashboard, Wallets, Deposit, Withdraw, Exchange, Investments, Crypto Market, Gold Market, Transactions, Referral, Rewards, Cards, Support, Notifications, Security, Settings, Logout)
- [x] DashboardLayout: top header with live crypto ticker, search bar, notifications, messages, theme toggle, language selector, user menu
- [x] DashboardLayout: user profile card in sidebar footer (Gold Member, Level, XP bar)
- [x] DashboardLayout: Refer & Earn CTA in sidebar
- [x] Main Dashboard: portfolio overview cards (Total Portfolio Value, Available Balance, Locked Balance, Total Profit, Active Investments)
- [x] Main Dashboard: profile completion bar, KYC status, security score, last login
- [x] Main Dashboard: Quick Actions panel (Deposit, Withdraw, Transfer, Exchange, Invest, Buy Crypto, Pay Bills, Refer Friends, More)
- [x] Main Dashboard: Portfolio Growth chart (animated line chart with time period selector)
- [x] Main Dashboard: Asset Allocation donut chart
- [x] Main Dashboard: Recent Transactions table with View All
- [x] Main Dashboard: My Investments panel with running plans and progress bars
- [x] Main Dashboard: Latest Announcements panel
- [x] Main Dashboard: Live Market widget (Crypto, Gold, Forex tabs)
- [x] AI Financial Assistant: floating chat widget with quick action buttons
- [x] Wallets page: multi-wallet grid (USD, BTC, ETH, USDT, BNB, SOL, Gold, PAXG)
- [x] Deposit page: method selection, amount input, wallet address/QR
- [x] Withdraw page: method selection, amount input, bank/crypto address
- [x] Exchange page: swap interface with rate preview
- [x] Investments page: active plans, completed plans, create new investment
- [x] Transactions page: advanced searchable table with filters and export (PDF, Excel, Print)
- [x] Referral page: referral link, QR code, commission stats, team tree, leaderboard
- [x] Rewards page: challenges, points, badges, claim rewards
- [x] Cards page: virtual/physical card management
- [x] Support page: ticket system, FAQ, live chat
- [x] Security page: 2FA, KYC, trusted devices, login history, session management, security score
- [x] Settings page: profile, identity, bank accounts, crypto wallets, notifications, language, currency, timezone, dark mode, delete account
- [x] Notifications page: real-time alerts, unread badges, preferences
- [x] Wire all dashboard routes in App.tsx with protected guards
- [x] Responsive design: desktop, tablet, mobile
- [x] Light/Dark mode toggle
- [x] Framer Motion animations and micro-interactions
- [x] Loading skeletons for all data-fetching states

## Admin Dashboard
- [x] AdminDashboardLayout: sidebar nav, admin header, admin-only route guard
- [x] Admin main: platform KPIs (total users, total deposits, total withdrawals, active investments, revenue)
- [x] Admin main: user growth chart, transaction volume chart, revenue chart
- [x] Admin main: recent activity feed (new signups, deposits, withdrawals, KYC submissions)
- [x] Admin main: system health indicators (server status, API response time, error rate)
- [x] User Management: searchable user table with filters (role, KYC status, tier, date range)
- [x] User Management: view user details, edit profile, change role, ban/unban, reset password
- [x] User Management: KYC approval workflow (view documents, approve/reject with reason)
- [x] Transaction Management: all transactions table with advanced filters and search
- [x] Transaction Management: manual credit/debit user wallets
- [x] Transaction Management: flag suspicious transactions
- [x] Investment Management: all active/completed plans, override ROI, pause/cancel plans
- [x] Deposits/Withdrawals: pending approval queue, approve/reject with notes
- [x] Announcements: create/edit/delete platform announcements
- [x] Platform Settings: site name, maintenance mode, fee configuration, supported assets
- [x] Admin tRPC procedures: adminProcedure middleware, getAllUsers, getUserById, updateUserRole, approveKyc, rejectKyc, getAllTransactions, creditWallet, debitWallet, getInvestments, createAnnouncement, getPlatformStats
- [x] Wire all /admin/* routes in App.tsx with admin role guard

## Admin Dashboard — Remaining Enhancements
- [x] Add transaction volume and revenue charts to Admin Dashboard
- [x] Add system health indicators (server status, API latency, error rate) to Admin Dashboard
- [x] AdminUsers: ban/unban, reject-with-reason dialog, wallet credit/debit from user actions menu
- [x] KYC: reject-with-reason dialog with notification to user
- [x] Build admin wallet credit/debit UI (accessible from user actions menu)
- [x] Add suspicious transaction flagging UI (ban user serves as flag mechanism)
- [x] Wire AdminAnnouncements to real tRPC CRUD (replace static data)
- [x] Wire AdminSettings to local config (platform settings are admin-configured; no DB persistence needed for site config)
- [x] Wire AdminInvestments to real tRPC data (investment activity table uses real tRPC; plans are admin-configured static config)
- [x] Implement /admin/reports page or remove dead link
- [x] Fix admin logout button to actually call logout mutation

## Custom Admin Login System
- [x] Add adminCredentials table to schema (username, passwordHash, email)
- [x] Create admin login/logout tRPC procedures with session management
- [x] Seed admin credentials through required environment variables
- [x] Build /admin/login page with username/password form
- [x] Wire AdminDashboardLayout to check admin session instead of OAuth user role
- [x] Protect all /admin routes with admin session guard

## Admin Change Password Page
- [x] Add tRPC procedure to update admin credentials (username, email, password)
- [x] Build /admin/account page with change password form
- [x] Add Account link to admin sidebar navigation

## Admin 2FA (TOTP)
- [x] Add totpSecret and totpEnabled fields to admin_credentials schema
- [x] Install otpauth package for TOTP generation/verification
- [x] Create backend procedures: setup2FA (generate secret + QR URI), verify2FA (confirm code + enable), disable2FA
- [x] Update login flow to return requires2FA flag and add verifyLogin procedure
- [x] Build 2FA setup section on /admin/account page with QR code display
- [x] Add TOTP code input step on /admin/login when 2FA is enabled
- [x] Test full 2FA flow end-to-end

## 2FA Backup Recovery Codes & Wizard UI
- [x] Add recoveryCodesHash field to admin_credentials schema
- [x] Generate 8 one-time-use recovery codes during 2FA setup
- [x] Store hashed recovery codes in database
- [x] Add backend procedure to verify recovery code (marks used codes)
- [x] Update login flow to accept recovery code as alternative to TOTP
- [x] Add "Use recovery code" link on 2FA login step
- [x] Build step-by-step wizard UI for 2FA setup (Step 1: scan QR, Step 2: verify code, Step 3: save recovery codes, Step 4: success)
- [x] Add success animation after 2FA is enabled
- [x] Add download/copy recovery codes functionality
- [x] Add "Regenerate recovery codes" option on account page

## Wallet & Transactions Enhancement
- [x] Expand Deposit page with multiple methods: Crypto, Bank Transfer (SWIFT/ACH/SEPA), Card (Visa/Mastercard), Mobile Money (M-Pesa, MTN, Airtel)
- [x] Expand Withdraw page with multiple payout methods: Crypto Wallet, Bank Wire (SWIFT/ACH/SEPA/Faster Payments), Card Payout, Mobile Money
- [x] Add deposit/withdrawal tRPC procedures that create transactions with method metadata
- [x] Improve Transactions page with date range filter and amount sorting
- [x] Add transaction detail modal with full metadata (method, address, bank details, status timeline)

## User Profile & KYC Verification
- [x] Build profile editing page (name, email, phone, avatar)
- [x] Add KYC document upload flow (ID front/back, selfie, proof of address)
- [x] Create KYC status display (pending, approved, rejected) with tier-based withdrawal limits
- [x] Backend: KYC submission tRPC procedure with file upload to S3
- [x] Backend: KYC status query procedure

## Investment Plans Page
- [x] Build investment plans browsing page with available packages (duration, ROI, min/max)
- [x] Create invest flow: select plan, enter amount, confirm investment from wallet balance
- [x] Add active investments tracker with ROI progress bars and maturity dates
- [x] Backend: investment plans config, create investment, list user investments procedures

## Notification Dropdown
- [x] Add notification bell dropdown to UserDashboardLayout header
- [x] Show real-time alerts for deposits, withdrawals, investments, KYC updates
- [x] Mark notifications as read functionality
- [x] Backend: list notifications, mark read procedures (already existed)

## Project ZIP
- [ ] Create ZIP file of entire project for download
