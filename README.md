# Internal Knowledge Sharing Platform

## Unified Development Startup

The workspace now supports a single-command development startup from the repository root.

### Prerequisites

- Node.js and npm
- Docker Desktop or another Docker engine with `docker compose`

### Environment Configuration

The root `.env` file is the source of truth for local startup.

1. If `.env` does not exist, the startup script creates it from `/.env.example`.
2. Update the values in `/.env` when you need custom ports, database credentials, or auth settings.

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

### Run Everything With One Command

Unix-like shells:

```bash
npm run dev
```

Windows PowerShell:

```powershell
npm run dev:windows
```

### What The Unified Startup Does

1. Starts PostgreSQL with `docker compose up -d` from [infra/docker-compose.yml](infra/docker-compose.yml)
2. Waits for the database port to accept connections
3. Starts the backend
4. Waits for the backend port to accept connections
5. Starts the frontend
6. Streams prefixed logs for both services in one terminal
7. Stops child processes cleanly on `Ctrl+C`

### Notes

- The unified backend startup uses the transpile-only TypeScript runtime script so existing unrelated type-check issues do not block local development.
- The frontend is served on `http://localhost:3000` by default.
- The backend API is served on `http://localhost:5000` by default.