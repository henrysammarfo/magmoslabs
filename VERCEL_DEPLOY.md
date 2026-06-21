# Vercel Deployment (MAGMOS)

This project is now configured to build with Nitro's `vercel` preset via `vite.config.ts`.

## 1) Create a Vercel project

- Import this repo into Vercel.
- Keep the **Root Directory** as the repository root.
- Use:
  - **Install Command:** `npm install`
  - **Build Command:** `npm run build:vercel`

## 2) Add environment variables in Vercel

Set these in **Project Settings -> Environment Variables**:

- `VITE_USDC_COIN_TYPE`
- `VITE_MAGMOS_PACKAGE_ID`
- `VITE_MAGMOS_TREASURY_ID`
- `VITE_MAGMOS_VAULT_ID`
- `VITE_ALLOCATION_REGISTRY_ID`
- `VITE_SCALLOP_MARKET_POOLS_URL`
- `VITE_AFTERMATH_POOLS_URL`
- `VITE_AFTERMATH_POOL_STATS_URL`
- `VITE_AFTERMATH_BEARER_TOKEN` (optional, if you have one)
- `VITE_DEEPBOOK_SUMMARY_URL` (use `https://deepbook-indexer.testnet.mystenlabs.com/summary` on testnet)

Copy values from your local `.env`.

## 3) Deploy

- Trigger deploy from Vercel dashboard (or push to the connected branch).
- Build output is generated to `.vercel/output` automatically by Nitro.

## 4) Post-deploy checks

- Open `/aurum`, `/saurum`, `/reserves`, `/dashboard`.
- Connect Sui wallet on **testnet** and test Forge/Smelt/Refine.
- Confirm `/reserves` shows non-zero backing after a Forge.

## Notes

- Do not deploy a prebuilt artifact generated on Windows. Let Vercel build on Linux.
- If wallet deep-linking behaves differently on mobile, test both direct URL open and in-app browser.
