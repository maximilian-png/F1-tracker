# Apex F1 — Race Tracker

A responsive Formula 1 tracker starter built with Next.js and TypeScript.

## Features
- Dark motorsport dashboard
- 2026 calendar with search
- Driver and constructor standings pages
- Attempts to load calendar and standings from the public Jolpica-F1 API
- Shows an explicit unavailable/preview state rather than inventing standings when the API cannot be reached

## Run locally
1. Install Node.js 20 or later.
2. In this folder, run `npm install`.
3. Run `npm run dev`.
4. Open the local address printed in the terminal.

## Deploy to Vercel
1. Upload these project files to a GitHub repository (the files should be in the repository root, not trapped inside a ZIP).
2. In Vercel, import that GitHub repository.
3. Framework preset: Next.js. Leave the build and output settings at their defaults.
4. Deploy.

Do not set `outputDirectory` to `public`; this is a Next.js app and Vercel should use its standard Next.js build output.

## Data note
This is an independent fan-made project and is not affiliated with Formula 1. API availability and coverage can change. The static calendar entries are a fallback preview, not a live timing feed. Live timing, live race control, and official session data are not included.
