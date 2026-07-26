# Namecheap production deployment

GoldVault runs as a full-stack Node.js application on Namecheap Shared Hosting.
The deployment workflow is manual so a production release only starts after an
operator explicitly selects **Deploy production** in GitHub Actions.

## cPanel application

Configure **Setup Node.js App** with:

- Node.js version: `24`
- Application mode: `Production`
- Application root: `/home/goldpphb/goldvault-app`
- Application URL: `https://goldvaults.us`
- Application startup file: `app.js`

The stable `app.js` file loads the versioned release selected by the `current`
symlink. The workflow keeps the original cPanel startup file as
`app.js.before-goldvault` and restores it if the first release fails.

## Required cPanel environment variables

Add these in **Setup Node.js App**. Never commit their values:

- `NODE_ENV=production`
- `DATABASE_URL=mysql://CPANEL_DB_USER:DB_PASSWORD@127.0.0.1:3306/CPANEL_DB_NAME`
- `JWT_SECRET` with at least 32 random characters

Add service credentials only for the features that are enabled:

- OAuth: `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`
- AI: `OPENAI_API_KEY`, `OPENAI_MODEL`
- Email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- SMS: `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`
- Push notifications: `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
- Storage/Forge: `BUILT_IN_FORGE_API_URL`, `BUILT_IN_FORGE_API_KEY`

`VITE_*` browser values must also be configured as GitHub Actions secrets
because Vite embeds them during the build.

## GitHub Actions secrets

The deployment workflow requires:

- `NAMECHEAP_SSH_PRIVATE_KEY`
- `NAMECHEAP_KNOWN_HOSTS`

Optional build-time browser configuration:

- `VITE_APP_ID`
- `VITE_OAUTH_PORTAL_URL`
- `VITE_FRONTEND_FORGE_API_URL`
- `VITE_FRONTEND_FORGE_API_KEY`

The workflow builds and tests the application, packages production
dependencies, uploads a versioned release over SSH, updates `current`, restarts
Passenger, and checks `https://goldvaults.us/`. A failed health check restores
the previous release automatically.
