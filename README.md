# Internal Knowledge Platform

Nền tảng nội bộ để quản lý và chia sẻ kiến thức trong khuôn khổ Hackathon. Repo được tổ chức dạng **monorepo** (npm workspaces): backend API, frontend web, và cấu hình hạ tầng tách bạch.

## Tóm tắt dự án hiện có

| Thành phần | Mô tả |
|------------|--------|
| **Backend** (`apps/backend`) | API **Express.js** + **Prisma** (PostgreSQL). Hiện có endpoint kiểm tra sức khỏe `GET /health`; chưa có nghiệp vụ domain hay xác thực. |
| **Frontend** (`apps/frontend`) | **Next.js 15** (App Router) + **Tailwind CSS** — giao diện khởi tạo mặc định. |
| **Cơ sở dữ liệu** | **PostgreSQL 16** — file `infra/docker-compose.postgres.yml` (chỉ DB khi dev trên máy) hoặc full stack trong `infra/docker-compose.yml`. |
| **CI/CD** | **GitLab** — `.gitlab-ci.yml`: cài đặt, build, lint (tùy chọn), build & push image Docker, deploy SSH (chỉ nhánh `main` / `production`). |
| **Triển khai** | **DigitalOcean Droplet** (mặc định trong tài liệu); script và compose production trong `infra/deploy/`. |
| **Prisma** | Đã kết nối PostgreSQL; `schema.prisma` hiện chỉ có datasource (model domain sẽ bổ sung theo roadmap). |
| **Tích hợp sau này** | Elasticsearch được dự kiến; **chưa** triển khai trong repo này. |

Cấu trúc thư mục chính:

```text
internal-knowledge-platform/
├── apps/
│   ├── backend/          # Express + Prisma + Dockerfile
│   └── frontend/         # Next.js + Tailwind + Dockerfile
├── docs/
│   ├── branch-strategy.md
│   └── kubernetes-roadmap.md
├── infra/
│   ├── docker-compose.postgres.yml   # Chỉ Postgres (npm run db:up)
│   ├── docker-compose.yml            # Postgres + backend + frontend (Docker)
│   └── deploy/                       # Compose production + script deploy + hướng dẫn server
├── .gitlab-ci.yml
├── .dockerignore
├── package.json
├── .env.example
└── README.md
```

## Yêu cầu môi trường

- **Node.js** ≥ 20  
- **npm** (kèm Node)  
- **Docker Desktop** (hoặc Docker Engine + Compose) — để chạy PostgreSQL  

## Cài đặt lần đầu

Từ thư mục gốc của repo:

```bash
npm install
```

Tạo file môi trường cho backend (bắt buộc trước khi dùng Prisma migrate / DB):

```bash
# Windows (PowerShell)
Copy-Item apps/backend/.env.example apps/backend/.env

# macOS / Linux
cp apps/backend/.env.example apps/backend/.env
```

Nội dung `DATABASE_URL` trong `.env` mặc định khớp với `docker-compose` (user `ikp`, database `ikp`).

Sinh Prisma Client (sau khi có `schema.prisma` hợp lệ):

```bash
npm run prisma:generate --workspace=backend
```

## Cách chạy dự án

### 1. Khởi động PostgreSQL

Bật Docker Desktop, sau đó:

```bash
npm run db:up
```

Kiểm tra container: tên `ikp-postgres`, port host **5432**.

Tắt khi không cần:

```bash
npm run db:down
```

Xem log Postgres:

```bash
npm run db:logs
```

### 2. Chạy backend (API)

Terminal 1 — từ thư mục gốc:

```bash
npm run dev:backend
```

- Mặc định API lắng nghe **http://localhost:4000** (đổi bằng `PORT` trong `apps/backend/.env`).  
- Kiểm tra nhanh: truy cập **http://localhost:4000/health** → JSON `{ "status": "ok" }`.

### 3. Chạy frontend

Terminal 2 — từ thư mục gốc:

```bash
npm run dev:frontend
```

- Ứng dụng web: **http://localhost:3000** (Next.js dev; có thể bật Turbopack trong script `dev` của frontend nếu cần).

### Build production (tham khảo)

```bash
npm run build --workspace=backend
npm run build --workspace=frontend
```

Chạy backend đã build: `npm run start --workspace=backend` (sau `tsc`).  
Chạy frontend production: `npm run start --workspace=frontend` (sau `next build`).

## Chạy bằng Docker (Postgres + API + Next.js)

Từ thư mục gốc (Docker build context là root monorepo):

```bash
npm run compose:up
```

- Frontend: **http://localhost:3000** — Backend: **http://localhost:4000** — Postgres nội bộ mạng compose.  
- Tắt: `npm run compose:down` — Log: `npm run compose:logs`

Build image thủ công:

```bash
docker build -f apps/backend/Dockerfile -t ikp-backend .
docker build -f apps/frontend/Dockerfile --build-arg NEXT_PUBLIC_API_URL=http://localhost:4000 -t ikp-frontend .
```

**Ghi chú:** Trong `apps/frontend/Dockerfile`, bước cài dependency dùng `npm install` **không** copy `package-lock.json`, vì lockfile tạo trên Windows thường thiếu optional native cho Linux (Tailwind v4 / lightningcss). Pipeline GitLab dùng `node:20-bookworm-slim` và `npm install` với lý do tương tự. Backend image vẫn dùng `npm ci` + lockfile.

## Chiến lược nhánh (tóm tắt)

| Nhánh | CI (build / docker) | Deploy tự động |
|--------|---------------------|----------------|
| `main`, `production` | Có | Có (job `deploy_production`) |
| `develop`, `feature/*`, khác | Có | Không |

Chi tiết, ví dụ merge request và lệnh Git: xem [docs/branch-strategy.md](docs/branch-strategy.md).

## CI/CD GitLab (luồng pipeline)

File cấu hình: **`.gitlab-ci.yml`**.

| Stage | Việc làm |
|--------|-----------|
| **install** | `npm install` (Linux bookworm; tránh lỗi optional native so với `npm ci` + lock Windows). |
| **build** | `prisma generate`, `npm run build` backend + frontend. |
| **test** | `npm run lint --workspace=frontend` (`allow_failure: true`). |
| **docker** | Build & push `backend` và `frontend` lên **GitLab Container Registry** (`$CI_REGISTRY_IMAGE/backend|frontend:$CI_COMMIT_SHORT_SHA` và `:latest`). Cần runner hỗ trợ **Docker-in-Docker**. |
| **deploy** | Chỉ khi nhánh **`main`** hoặc **`production`**: SSH tới server, chạy `infra/deploy/remote-deploy.sh` (đăng nhập registry, `docker compose pull` + `up -d`). |

### Biến GitLab CI/CD (Settings → CI/CD → Variables)

| Biến | Mô tả |
|------|--------|
| `DEPLOY_SSH_PRIVATE_KEY` | Private key SSH (khuyến nghị **Protected** + **Masked**; loại File nếu phù hợp). |
| `DEPLOY_HOST` | IP hoặc hostname Droplet. |
| `DEPLOY_USER` | User SSH (ví dụ `deploy`). |
| `NEXT_PUBLIC_API_URL` | (Tùy chọn) URL API công khai khi build image frontend. |

Không hardcode mật khẩu registry: pipeline dùng biến có sẵn `CI_REGISTRY`, `CI_REGISTRY_USER`, `CI_REGISTRY_PASSWORD`.

## Triển khai production (DigitalOcean Droplet)

1. Tạo Droplet Ubuntu, cài Docker Engine + Compose plugin, tạo user `deploy` và thư mục `/opt/ikp`.  
2. Copy `infra/deploy/docker-compose.prod.yml` → `/opt/ikp/docker-compose.prod.yml`, tạo `/opt/ikp/.env` từ `infra/deploy/.env.example`.  
3. Gán public key tương ứng với `DEPLOY_SSH_PRIVATE_KEY` cho user deploy.  

Hướng dẫn đầy đủ: [infra/deploy/SERVER_SETUP_DIGITALOCEAN.md](infra/deploy/SERVER_SETUP_DIGITALOCEAN.md).  
(AWS EC2 là phương án tương đương: security group mở 22/80, các bước Docker giống hệt.)

## Nâng cấp tùy chọn: Kubernetes

Thiết kế mức cao (Pods, Deployments, Ingress, GitOps): [docs/kubernetes-roadmap.md](docs/kubernetes-roadmap.md). Chưa có manifest k8s trong repo.

## Script hữu ích (thư mục gốc)

| Lệnh | Ý nghĩa |
|------|---------|
| `npm run dev:backend` | API dev (watch) |
| `npm run dev:frontend` | Next.js dev |
| `npm run db:up` / `db:down` / `db:logs` | Chỉ Postgres (`docker-compose.postgres.yml`) |
| `npm run compose:up` / `compose:down` / `compose:logs` | Full stack Docker (`infra/docker-compose.yml`) |

Trong `apps/backend`: `prisma:migrate`, `prisma:studio`, v.v. — xem `apps/backend/package.json`.

## Biến môi trường

- **Gợi ý tổng hợp:** `.env.example` ở root.  
- **Backend thực tế:** `apps/backend/.env` (không commit; đã có trong `.gitignore`).  
- **Frontend (tùy chọn):** `apps/frontend/.env.local` — ví dụ `NEXT_PUBLIC_API_URL` khi nối API.

## Bảo trì tài liệu (bắt buộc đối với contributor)

**Mỗi khi dự án thay đổi** (stack, cấu trúc thư mục, lệnh chạy, biến môi trường, endpoint mới, migration DB, tính năng đáng kể), hãy **cập nhật `README.md` trong cùng PR/commit** để hướng dẫn luôn khớp code. Nếu thêm bước bắt buộc (ví dụ seed, auth), ghi rõ vào các mục tương ứng ở trên.

---

*Cập nhật lần cuối: thêm Docker image, Compose full stack, GitLab CI/CD, deploy SSH (DigitalOcean), tài liệu nhánh & Kubernetes roadmap; foundation API vẫn chỉ `/health`.*
