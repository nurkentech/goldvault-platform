# GoldVaults advanced modules (tasks 21–40)

The second implementation batch is exposed through `appRouter.advanced`, the REST API-key routes under `/api/v1`, the user dashboard, and the admin Compliance & Operations console.

## Deployment checklist

1. Apply `drizzle/0009_simple_doorman.sql` to the target MySQL database.
2. Configure the existing database, session, email, storage, and payment-provider variables.
3. Configure SMS fallback when it is enabled:
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_FROM_NUMBER`
4. Configure browser push notifications:
   - `VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (for example `mailto:support@example.com`)
5. Configure the read-only GoldVault AI Copilot:
   - `OPENAI_API_KEY`
   - `OPENAI_MODEL` (currently `gpt-5.6-sol`)

VAPID keys use URL-safe Base64 P-256 public/private values. The `generateVapidKeys()` export in `server/pushNotifications.ts` produces a compatible pair.

## Operational notes

- Recurring deposits, staking maturity/compounding, and expired P2P escrow refunds are processed by the application heartbeat. Run one scheduler instance in multi-instance deployments or move these processors to a singleton job worker.
- External recurring deposits create pending processor instructions; a configured payment processor must execute and confirm them.
- Physical cards enter a pending issuance queue. Admins issue or reject them from Compliance & Operations; connecting a card processor is still required to manufacture and ship physical cards.
- Webhook secrets and API-key plaintext are returned only at creation time. Store them immediately.
- Untrusted withdrawal IPs receive a 24-hour hold. Adding a trusted IP requires an email OTP, and accounts with 2FA must supply a second factor for withdrawals.
- The native Web Push implementation removes expired subscriptions after `404` or `410` responses.
- GoldVault AI uses the Responses API with strict structured output and `store: false`. It receives redacted, bounded account or case context and has no transaction, withdrawal, approval, messaging, or authentication tools.
- AI support replies and compliance summaries are drafts only. A human must review and perform any subsequent action in the normal admin workflow.
- Run `node check_openai.mjs` after configuring billing and quota to verify the model and structured-output contract without sending customer data.

## Implemented modules

P2P escrow and disputes, five-language preferences, staking, cards, TOTP/SMS/backup-code 2FA, AML/SAR monitoring, savings vaults, PWA/push, support tickets, trusted withdrawal IPs, portfolio and tax analytics, loyalty tiers, database-backed themes, signed webhooks, scoped API keys, premium e-sign agreements, recurring deposits, affiliate operations, WCAG-oriented navigation/focus/motion support, and the blog/knowledge-base CMS.

## GoldVault AI Copilot

The user Copilot provides portfolio explanations, deterministic market-shock illustrations, recent-activity summaries, knowledge-base grounding, conversation history, and helpful/unhelpful feedback in the user’s selected language. The admin Copilot can draft a support response or summarize the evidence attached to an AML alert, but it cannot send, approve, reject, file, or modify records.

Apply `drizzle/0010_smooth_blue_marvel.sql` before enabling the Copilot in a deployed environment. Usage, refusals, provider errors, latency, token counts, model name, and provider request IDs are audited without storing the API credential.
