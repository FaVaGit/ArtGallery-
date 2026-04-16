# ArtGallery Prototype

Full-stack portfolio application for decorative facades and roofing projects.

- **Frontend**: React + Vite + TypeScript, Fluent/Modern UI design, Fabric.js canvas gallery
- **Backend**: Node.js + Express + TypeScript, Google Drive integration
- **Architecture**: Event-Driven (typed EventBus singleton)
- **Live site**: https://favagit.github.io/ArtGallery-/

## Scripts

From project root:

- npm run dev
  - Starts frontend and backend together.
  - Frontend default URL: http://localhost:5173
  - Backend health endpoint: http://localhost:4000/api/health

## Frontend UI

Implemented pages:

- `/`: customer portfolio browsing page (folders and media grid)
- `/admin`: admin login and Drive content management panel

Additional capabilities:

- Language switch (EN/IT) in top navigation.
- Runtime configuration panel in admin page for:
  - Brand name
  - Frontend API base URL
  - Default folder ID
  - Visibility mode (public/private)

Frontend API base URL:

- Optional env var in frontend `.env`: `VITE_API_BASE_URL`
- Default fallback: `http://localhost:4000/api`
- Can be overridden at runtime from Admin configuration panel.

- npm run build
  - Builds frontend and backend.

- npm run start
  - Starts backend production build from dist.

## Project Structure

- frontend: customer and admin web UI
- backend: API services and integrations
- .github: Copilot project workflow checklist

## Current Status

- React + Vite + TypeScript frontend with Fluent/Modern UI design
- Event-Driven Architecture with typed EventBus
- Fabric.js interactive canvas gallery (zoom, pan, selection)
- Dual view modes: grid and canvas
- JWT auth with admin/viewer roles
- i18n support (EN/IT)
- Runtime configuration panel
- CI workflow: lint + build on push/PR to main
- GitHub Pages deployment: automated on push to main
- Backend API with Google Drive integration

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

## Backend Deployment on Render (Free Tier)

A `render.yaml` Blueprint is included in the repository.

### Quick Setup

1. Go to https://dashboard.render.com and sign in with GitHub.
2. Click **New** → **Blueprint** and select the **FaVaGit/ArtGallery-** repo.
3. Render reads `render.yaml` and creates the **artgallery-backend** web service.
4. In the Render dashboard set the following environment variables (marked `sync: false`):
   - `AUTH_USERS_JSON` — e.g. `[{"username":"admin","password":"strongpwd","role":"admin"}]`
   - `GOOGLE_DRIVE_ROOT_FOLDER_ID` — the Google Drive folder shared with the service account
   - `GOOGLE_SERVICE_ACCOUNT_JSON` — full JSON key of the Google service account
5. Deploy triggers automatically. Health check: `GET /api/health`.

### Connect Frontend to Backend

After Render assigns a URL (e.g. `https://artgallery-backend.onrender.com`):

1. Open the live site: https://favagit.github.io/ArtGallery-/
2. Go to **Admin** → **Configuration** panel.
3. Set **API Base URL** to `https://artgallery-backend.onrender.com/api`.
4. Save — the app will reconnect and exit demo mode.

> **Note:** Render free-tier services spin down after 15 min of inactivity.
> The first request after idle may take ~30 s while the service restarts.

## Google Drive Backend Integration

Google Drive service endpoints are now available under `/api/drive`.

### Authentication and Roles

Backend now supports JWT authentication with roles:

- `admin`: can perform Drive write operations (create, rename, move, copy, delete)
- `viewer`: read-only access

Required env vars in `backend/.env`:

- `AUTH_JWT_SECRET`
- `AUTH_USERS_JSON` (JSON array of users with username, password, role)
- `AUTH_JWT_EXPIRES_IN` (optional, default `12h`)

Auth endpoints:

- `POST /api/auth/login`
  - Body: `{ "username": "admin", "password": "..." }`
  - Returns JWT token and user role.
- `GET /api/auth/me`
  - Requires header: `Authorization: Bearer <token>`

Drive write endpoints require `admin` token:

- `POST /api/drive/folders`
- `PATCH /api/drive/items/:itemId/rename`
- `PATCH /api/drive/items/:itemId/move`
- `POST /api/drive/items/copy`
- `DELETE /api/drive/items/:itemId`

### Credentials

Create backend environment file from `backend/.env.example` and set:

- `GOOGLE_DRIVE_ROOT_FOLDER_ID`: root folder used by the gallery.
- Credentials using one of these options:
  - `GOOGLE_SERVICE_ACCOUNT_JSON`
  - `GOOGLE_CLIENT_EMAIL` and `GOOGLE_PRIVATE_KEY`

Service account access requirement:

- Share your target Google Drive folder with the service account email.

### Available Drive Endpoints

- `GET /api/drive/status`
  - Validate Drive credentials and access.
- `GET /api/drive/folders?parentId=<id>`
  - List child folders for a parent.
  - If `parentId` is omitted, `GOOGLE_DRIVE_ROOT_FOLDER_ID` is used.
- `GET /api/drive/items?folderId=<id>&pageSize=100&pageToken=<token>&search=<name>`
  - List files/folders inside a folder.
  - If `folderId` is omitted, `GOOGLE_DRIVE_ROOT_FOLDER_ID` is used.
- `POST /api/drive/folders`
  - Create folder.
  - Body: `{ "name": "Project A", "parentId": "..." }` (`parentId` optional if root configured).
- `PATCH /api/drive/items/:itemId/rename`
  - Rename file or folder.
  - Body: `{ "name": "New Name" }`
- `PATCH /api/drive/items/:itemId/move`
  - Move file or folder.
  - Body: `{ "targetParentId": "..." }`
- `POST /api/drive/items/copy`
  - Copy file or folder.
  - Body: `{ "itemId": "...", "targetParentId": "...", "name": "Optional copy name" }`
- `DELETE /api/drive/items/:itemId`
  - Delete file or folder.

## Next Implementation Steps

1. Add Google Drive integration for album/folder-driven galleries.
2. Add role-based admin auth and protected management routes.
3. Build public showcase pages and admin management panel.
4. Add multilingual support and configuration panel.
5. Add private/public visibility controls and performance optimizations for large media collections.
