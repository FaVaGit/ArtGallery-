# ArtGallery Prototype

Full-stack prototype with:
- Frontend: React + Vite + TypeScript
- Backend: Node.js + Express + TypeScript

## Scripts

From project root:

- npm run dev
  - Starts frontend and backend together.
  - Frontend default URL: http://localhost:5173
  - Backend health endpoint: http://localhost:4000/api/health

- npm run build
  - Builds frontend and backend.

- npm run start
  - Starts backend production build from dist.

## Project Structure

- frontend: customer and admin web UI
- backend: API services and integrations
- .github: Copilot project workflow checklist

## Current Status

- React stack scaffolded and working
- Backend API base running and compiled
- VS Code task created: Run ArtGallery Prototype
- CI workflow added: lint + full build on push/PR to main
- GitHub Pages deployment workflow added for frontend

## GitHub Pages Deployment

This repository includes a GitHub Actions workflow that publishes the frontend to GitHub Pages.

1. Push this repository to GitHub.
2. In repository settings, open Pages and set Build and deployment Source to GitHub Actions.
3. The workflow `.github/workflows/deploy-pages.yml` will publish the `frontend/dist` artifact.

Published URL format:

- https://<github-username>.github.io/<repository-name>/

## Backend Hosting Note

GitHub Pages hosts only static files. The backend API cannot run on GitHub Pages.

For production, keep frontend on GitHub Pages and deploy backend separately (for example Render, Railway, Azure Web App, or VPS), then configure frontend API base URL.

## Next Implementation Steps

1. Add Google Drive integration for album/folder-driven galleries.
2. Add role-based admin auth and protected management routes.
3. Build public showcase pages and admin management panel.
4. Add multilingual support and configuration panel.
5. Add private/public visibility controls and performance optimizations for large media collections.
