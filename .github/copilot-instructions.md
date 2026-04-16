# ArtGallery - Copilot Instructions

## Project Checklist

- [x] Verify copilot-instructions.md created
- [x] Clarify Project Requirements
- [x] Scaffold the Project (React Vite frontend + Node Express backend)
- [x] Customize the Project (Next.js to React, Modern UI, Fabric.js, Event-Driven Architecture)
- [x] Install Required Extensions (none needed)
- [x] Compile the Project (npm run build passed)
- [x] Create and Run Task (Run ArtGallery Prototype)
- [x] Launch the Project (deployed to GitHub Pages)
- [x] Ensure Documentation is Complete

## Architecture

- Frontend: React + Vite + TypeScript with Fluent/Modern UI design
- Backend: Node.js + Express + TypeScript
- Event-Driven Architecture with typed EventBus singleton
- Fabric.js v6 interactive canvas gallery
- JWT authentication with admin/viewer roles
- i18n support (EN/IT)
- Google Drive API integration via service account

## Development

- `npm run dev` — Start frontend and backend concurrently
- `npm run build` — Build frontend (Vite) and backend (tsc)
- `npm run lint` — ESLint frontend

## CI/CD

- CI workflow: `.github/workflows/ci.yml` (lint + build on push/PR to main)
- Deploy workflow: `.github/workflows/deploy-pages.yml` (GitHub Pages on push to main)
- Live URL: https://favagit.github.io/ArtGallery-/

## Hosting

- Frontend: GitHub Pages (static)
- Backend: Render free tier (`render.yaml` Blueprint in repo root)
- CORS_ORIGIN env var restricts backend to `https://favagit.github.io`

## Guidelines

- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.
