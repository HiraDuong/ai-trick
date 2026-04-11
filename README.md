# Internal Knowledge Sharing Platform

## Unified Development Startup

The workspace supports single-command development startup from repository root.

### Prerequisites

- Node.js and npm
- Docker Desktop (or Docker engine with `docker compose`)

### Environment Configuration

The root `.env` file is the source of truth for local startup.

1. If `.env` does not exist, startup scripts create it from `.env.example`.
2. Update values in `.env` for custom ports, credentials, and auth settings.

Important variables:

- `POSTGRES_PORT`
- `PORT`
- `FRONTEND_PORT`
- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `API_BASE_URL`
- `CORS_ORIGIN`

### Run Everything

Unix-like shells:

```bash
npm run dev
```

Windows PowerShell:

```powershell
npm run dev:windows
```

### Startup Workflow

1. Starts PostgreSQL using `docker compose up -d` from `infra/docker-compose.yml`
2. Waits for database port readiness
3. Starts backend
4. Waits for backend port readiness
5. Starts frontend
6. Streams prefixed logs for both services in one terminal
7. Stops child processes cleanly on `Ctrl+C`

### Notes

- Unified backend startup uses transpile-only TypeScript runtime so unrelated type-check issues do not block local dev.
- Frontend defaults to `http://localhost:3000`.
- Backend defaults to `http://localhost:5000`.
