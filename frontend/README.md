# FuelEU Maritime Frontend

Frontend application built with Vite, React, TypeScript, and Tailwind CSS.

## Architecture

This project follows hexagonal architecture principles:

- **core/domain** - Domain models, types, and business logic (no framework dependencies)
- **core/ports** - Interface definitions for adapters
- **application** - Application services and React hooks (can use React Query)
- **adapters** - API clients and external service integrations
- **ui** - React components, pages, and layouts (only place React is used)
- **shared** - Shared utilities, constants, and types

## Rules

- No React imports in core/domain or core/ports
- React Query only in application layer
- React components only in ui layer
- TypeScript strict mode

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

