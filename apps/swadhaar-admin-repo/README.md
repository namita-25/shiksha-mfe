# Swadhaar Admin Application (`swadhaar-admin-repo`)

Centralized administrative portal for Swadhaar FinAccess operations, managing regional training centers, batches, CFL/DI trainers, and learner progression through Swadhaar training modules.

## Tenant Configuration

- **Tenant Name:** Swadhaar FinAccess
- **Tenant ID:** `35529b5d-526f-4da5-bc6e-64f740023d26`
- **Channel ID:** `swadhaar-channel`
- **Content Framework:** `swadhaar-framework`
- **Collection Framework:** `swadhaar-framework`
- **Academic Year ID:** `edf1d200-21d8-417e-b844-1d04f92435f4`

## Features

- **Branding & Theming:** Swadhaar brand palette featuring Primary `#E6873C` and Dark Navy `#1C2B4A`.
- **Localization:** Supports English (`en`), Marathi (`mr`), and Hindi (`hi`).
- **Dashboard:** Real-time metrics on learners, trainers, centers, and batch completion rates.
- **Center & Batch Management:** Track and monitor centers and ongoing batches.
- **Learner & Trainer Rosters:** Filter and manage user progression through Swadhaar levels.
- **Reports:** Export training summaries and certification records.

## Running Locally

Run via Nx from the workspace root:

```bash
# Start development server
npx nx dev swadhaar-admin-repo

# Build production bundle
npx nx build swadhaar-admin-repo

# Start production server
npx nx start swadhaar-admin-repo
```

Or using npm scripts:

```bash
npm run dev:swadhaar-admin
npm run build:swadhaar-admin
```

## Docker & PM2 Support

- Dockerfile: `Dockerfile.swadhaar-admin-repo`
- Docker Compose: `docker-compose.swadhaar-admin-repo.yml`
- PM2 Ecosystem: `ecosystem.swadhaar-admin-repo.config.js`


# Start development server (Nx)
npx nx dev swadhaar-admin-repo

# Or via npm script
npm run dev:swadhaar-admin

# Build production bundle
npm run build:swadhaar-admin
