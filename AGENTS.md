# AGENTS.md

This repository is a Vercel-first intake app for Brightify Solar.

## Project Overview

The app collects solar planset requests, uploads site photos directly to Vercel Blob, and stores a structured JSON submission manifest through Vercel Functions.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19 + Vite 7 |
| Styling | Tailwind CSS 4 + custom CSS variables |
| Validation | Zod |
| File Storage | Vercel Blob |
| Backend | Vercel Functions in `api/` |
| Language | TypeScript 5 |
| Deployment | Vercel |

## Directory Structure

```text
├── api
│   ├── intake.ts        # Accepts the final JSON intake payload and stores a manifest in Vercel Blob.
│   └── uploads.ts       # Issues Vercel Blob client-upload tokens for direct browser uploads.
├── public
│   ├── brightify-logo.png
│   └── favicon.ico
├── src
│   ├── components
│   │   ├── FileUploadCard.tsx
│   │   └── IntakeForm.tsx
│   ├── lib
│   │   └── intake.ts    # Shared intake constants and types used by frontend and API routes.
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── .env.example
├── .gitignore
├── AGENTS.md
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Key Concepts

### Vercel Blob Upload Flow

1. The browser requests an upload token from `api/uploads.ts`.
2. Files upload directly from the browser to Vercel Blob.
3. The client submits the final metadata payload to `api/intake.ts`.
4. `api/intake.ts` writes a JSON manifest into Vercel Blob containing the form fields and uploaded file references.

This avoids pushing large multipart form bodies through a single serverless function.

### Configuration

The project expects `BLOB_READ_WRITE_TOKEN` in local development. In Vercel, attach a Blob store to the project and Vercel will inject the variable automatically.

## Development Commands

```bash
npm install
npm run dev
npm run check
npm run build
```

## Conventions

- Components use PascalCase.
- Shared constants and types live in `src/lib/`.
- Vercel Functions live in `api/` and should return standard `Response` objects.
- Keep frontend code free of deployment-specific assumptions beyond the `/api/*` contract.
- Prefer direct browser-to-Blob uploads for large files instead of server-side multipart forwarding.
