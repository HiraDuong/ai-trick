# Internal Knowledge Platform

Nen tang noi bo de quan ly va chia se kien thuc trong khuon kho Hackathon. Repo duoc to chuc dang monorepo bang npm workspaces, tach backend API, frontend web, tai lieu, script van hanh, va cau hinh ha tang.

## Tom tat du an hien co

| Thanh phan | Mo ta |
| --- | --- |
| Backend (`apps/backend`) | Express.js 5 + TypeScript + Prisma 7 + PostgreSQL. Hien da co auth JWT, phan quyen `AUTHOR` / `EDITOR` / `VIEWER`, bai viet, category tree, dashboard feed, search, comments, helpfulness, reactions, bookmarks, notifications, stats, version history, restore version, va studio edit flow. |
| Frontend (`apps/frontend`) | Next.js 16 (App Router) + React 19 + Tailwind CSS 4. Giao dien da co home dashboard, article archive, article detail, search, bookmarks, studio, login, notification bell, va shared layout. |
| Co so du lieu | PostgreSQL. Prisma schema hien da co day du model domain: `User`, `Category`, `Article`, `Tag`, `ArticleVersion`, `Comment`, `HelpfulnessRating`, `Bookmark`, `Reaction`, `Notification`, `ArticleViewSession`. |
| CI/CD | GitLab CI qua `.gitlab-ci.yml`: `install`, `build`, `test`, `docker`, `deploy`. Pipeline build va push Docker image, sau do deploy SSH cho `main` / `production`. |
| Trien khai | Production deploy qua `infra/deploy/docker-compose.prod.yml` va `infra/deploy/remote-deploy.sh`. Tai lieu server co san cho DigitalOcean trong `infra/deploy/SERVER_SETUP_DIGITALOCEAN.md`. |
| Prisma | Da ket noi PostgreSQL va generate client workspace `backend`; co script migrate, generate, va seed / validation script. |
| Tich hop sau nay | Kubernetes roadmap da co trong `docs/kubernetes-roadmap.md`. Elasticsearch chua duoc trien khai trong repo hien tai. |

## Cau truc thu muc chinh

```text
internal-knowledge-platform/
├── apps/
│   ├── backend/          # Express + TypeScript + Prisma + validation / seed scripts
│   └── frontend/         # Next.js App Router + Tailwind CSS
├── docs/
│   ├── branch-strategy.md
│   └── kubernetes-roadmap.md
├── infra/
│   ├── docker-compose.postgres.yml   # Chi Postgres cho local dev
│   ├── docker-compose.yml            # Local DB used by unified startup scripts
│   └── deploy/                       # Compose production + script deploy + server guide
├── prompt/                           # Task prompt, bug reports, review artifacts
├── scripts/                          # Unified dev runner helpers
├── .gitlab-ci.yml
├── .dockerignore
├── .env.example
├── package.json
└── README.md
```

## Yeu cau moi truong

- Node.js >= 20
- npm
- Docker Desktop hoac Docker Engine + Compose
- PostgreSQL se chay qua Docker trong local workflow

## Cai dat lan dau

Tu thu muc goc cua repo:

```bash
npm install
```

Tao file moi truong cho unified startup o root:

```powershell
# Windows PowerShell
Copy-Item .env.example .env
```

```bash
# macOS / Linux
cp .env.example .env
```

Neu can dung Prisma migrate truc tiep trong workspace backend, tao them file moi truong cho backend:

```powershell
# Windows PowerShell
Copy-Item apps/backend/.env.example apps/backend/.env
```

```bash
# macOS / Linux
cp apps/backend/.env.example apps/backend/.env
```

Sinh Prisma Client:

```bash
npm run prisma:generate --workspace=backend
```

## Cach chay du an

### 1. Chay toan bo local bang unified startup

Tu thu muc goc:

```bash
npm run dev
```

```powershell
npm run dev:windows
```

Unified startup hien tai se:

1. Khoi dong PostgreSQL bang `infra/docker-compose.yml`
2. Cho DB san sang
3. Chay backend
4. Cho backend san sang
5. Chay frontend
6. Stream log trong mot terminal

Mac dinh:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- API base: `http://localhost:5000/api`

### 2. Chi khoi dong PostgreSQL

```bash
npm run db:up
```

Tat DB:

```bash
npm run db:down
```

Xem log:

```bash
npm run db:logs
```

Luu y quan trong:

- `infra/docker-compose.postgres.yml` dang dung bo credential mac dinh khac voi root `.env.example`.
- Neu ban chay DB bang `npm run db:up`, hay dam bao `DATABASE_URL` / `SHADOW_DATABASE_URL` khop voi DB ma ban dang bat.

### 3. Chay backend rieng

Terminal 1, tu thu muc goc:

```bash
npm run dev:backend
```

API root:

- `http://localhost:5000/`

Health check:

- `http://localhost:5000/api/health`

### 4. Chay frontend rieng

Terminal 2, tu thu muc goc:

```bash
npm run dev:frontend
```

Web app:

- `http://localhost:3000`

## Build production

```bash
npm run build --workspace=backend
npm run build --workspace=frontend
```

Chay backend da build:

```bash
npm run start --workspace=backend
```

Chay frontend production:

```bash
npm run start --workspace=frontend
```

## Docker va Compose

### Local compose

```bash
npm run compose:up
```

Tat:

```bash
npm run compose:down
```

Xem log:

```bash
npm run compose:logs
```

Trang thai hien tai cua repo:

- `infra/docker-compose.yml` duoc unified startup su dung de bat local database.
- Full production stack nam o `infra/deploy/docker-compose.prod.yml`.

### Build image thu cong

```bash
docker build -f apps/backend/Dockerfile -t ikp-backend .
docker build -f apps/frontend/Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000/api -t ikp-frontend .
```

## Chien luoc nhanh (tom tat)

| Nhanh | CI (build / docker) | Deploy tu dong |
| --- | --- | --- |
| `main`, `production` | Co | Co |
| `develop`, `feature/*`, `fix/*`, khac | Co | Khong |

Chi tiet them xem tai `docs/branch-strategy.md`.

## CI/CD GitLab

File cau hinh: `.gitlab-ci.yml`

| Stage | Viec lam |
| --- | --- |
| `install` | `npm install` tren `node:20-bookworm-slim` |
| `build` | `prisma generate`, build backend, build frontend |
| `test` | `npm run lint --workspace=frontend` (`allow_failure: true`) |
| `docker` | Build va push image backend/frontend len GitLab Container Registry |
| `deploy` | SSH toi server va chay `infra/deploy/remote-deploy.sh` cho `main` / `production` |

### Bien GitLab CI/CD can co

| Bien | Mo ta |
| --- | --- |
| `DEPLOY_SSH_PRIVATE_KEY` | SSH private key cho user deploy |
| `DEPLOY_HOST` | IP hoac hostname server |
| `DEPLOY_USER` | User SSH deploy |
| `NEXT_PUBLIC_API_URL` | Tuy chon, dung khi build image frontend |

Pipeline cung su dung cac bien san co cua GitLab Registry:

- `CI_REGISTRY`
- `CI_REGISTRY_USER`
- `CI_REGISTRY_PASSWORD`
- `CI_REGISTRY_IMAGE`

## Trien khai production

Production hien tai duoc thiet ke quanh:

- `infra/deploy/docker-compose.prod.yml`
- `infra/deploy/remote-deploy.sh`
- `infra/deploy/SERVER_SETUP_DIGITALOCEAN.md`

Luong co ban:

1. Build va push backend/frontend image tu GitLab CI
2. SSH vao server
3. Pull image moi
4. `docker compose up -d`

Production compose hien tai gom:

- PostgreSQL 16
- Backend container port `4000`
- Frontend container public port `80`

## Tinh nang backend hien co

Backend khong con la foundation API toi gian. Hien tai repo da co cac nhom endpoint chinh:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/articles`
- `GET /api/articles/:articleId`
- `POST /api/articles`
- `PATCH /api/articles/:articleId`
- `DELETE /api/articles/:articleId`
- `PATCH /api/articles/:articleId/publish`
- `PATCH /api/articles/:articleId/unpublish`
- `GET /api/articles/:articleId/versions`
- `POST /api/articles/:articleId/restore`
- `GET/POST /api/articles/:articleId/comments`
- `GET/POST /api/articles/:articleId/helpfulness`
- `GET /api/articles/:articleId/stats`
- `GET /api/articles/:articleId/reactions`
- `POST /api/reactions`
- `GET /api/categories/tree`
- `GET /api/dashboard/feed`
- `GET /api/search/articles`
- `GET/POST/DELETE /api/bookmarks`
- `GET /api/notifications`
- `PATCH /api/notifications/:notificationId/read`

## Tinh nang frontend hien co

Frontend khong con la giao dien khoi tao mac dinh. Hien da co:

- Home dashboard du lieu that
- Article archive va article detail
- Search page
- Bookmarks page
- Login flow
- Studio / draft editing flow
- Version history panel
- Notification bell
- Shared header, search bar, category tree sidebar

## Script huu ich (thu muc goc)

| Lenh | Y nghia |
| --- | --- |
| `npm run dev` | Unified startup cho Unix-like shell |
| `npm run dev:windows` | Unified startup cho PowerShell |
| `npm run dev:backend` | Chay backend dev |
| `npm run dev:frontend` | Chay frontend dev |
| `npm run db:up` / `db:down` / `db:logs` | Quan ly Postgres local |
| `npm run compose:up` / `compose:down` / `compose:logs` | Quan ly compose local |
| `npm run test:task26:be` | Chay backend regression harness |

Trong `apps/backend/package.json` con co:

- `prisma:generate`
- `prisma:migrate`
- `seed:engagement`
- `test:task32:be`
- `test:task34:be`

## Bien moi truong

### Root `.env`

Unified startup dang doc root `.env` lam source of truth. Cac bien chinh:

- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `POSTGRES_PORT`
- `PORT`
- `FRONTEND_PORT`
- `DATABASE_URL`
- `SHADOW_DATABASE_URL`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `API_BASE_URL`
- `CORS_ORIGIN`

### Backend `.env`

`apps/backend/.env` duoc dung khi ban chay Prisma migrate / generate hoac chay backend rieng theo backend workspace.

### Frontend `.env.local`

Co the them `apps/frontend/.env.local` neu can config rieng cho frontend, vi du `NEXT_PUBLIC_API_URL`.

## Tai lieu bo sung

- `docs/branch-strategy.md`
- `docs/kubernetes-roadmap.md`
- `infra/deploy/SERVER_SETUP_DIGITALOCEAN.md`

## Bao tri tai lieu

Moi khi stack, lenh chay, bien moi truong, DB schema, endpoint, hay luong deploy thay doi, contributor can cap nhat `README.md` trong cung PR/commit de tai lieu luon khop voi code hien tai.

Cap nhat lan cuoi: README duoc viet lai theo trang thai thuc te cua monorepo hien tai, bao gom backend API domain day du, frontend App Router da duoc trien khai, GitLab CI/CD, production deploy qua SSH, va ghi chu ro su khac nhau giua local DB workflows.
