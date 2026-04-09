# Cloud Run Deployment

This directory contains additive deployment helpers for running the frontend and backend on Google Cloud Run using Google Artifact Registry images.

## Services

- Frontend Cloud Run service: Next.js production server listening on `0.0.0.0:${PORT}`
- Backend Cloud Run service: compiled Express + Prisma server listening on `0.0.0.0:${PORT}`

Both Dockerfiles expose port `8080`, which matches Cloud Run expectations.

## Required Google Cloud variables

- `GCP_PROJECT_ID`
- `GCP_REGION`
- `GCP_SERVICE_ACCOUNT_KEY`
- `ARTIFACT_REGISTRY_REPOSITORY`

Optional defaults:

- `CLOUD_RUN_BACKEND_SERVICE` (defaults to `backend-service`)
- `CLOUD_RUN_FRONTEND_SERVICE` (defaults to `frontend-service`)

`ARTIFACT_REGISTRY_REPOSITORY` must exactly match the existing Artifact Registry Docker repository name in Google Cloud. Example: if you created `ikp-images`, set `ARTIFACT_REGISTRY_REPOSITORY=ikp-images`.

## Backend deploy variables

- `CLOUD_RUN_BACKEND_SERVICE`
- `IMAGE_TAG`
- `BACKEND_DATABASE_URL`
- `BACKEND_JWT_SECRET`
- `BACKEND_JWT_EXPIRES_IN`
- `BACKEND_CORS_ORIGIN`

Optional:

- `BACKEND_IMAGE_NAME` (default `backend`)
- `BACKEND_SERVICE_ACCOUNT`
- `BACKEND_MIGRATION_SERVICE_ACCOUNT` (defaults to `BACKEND_SERVICE_ACCOUNT`)
- `BACKEND_ALLOW_UNAUTHENTICATED` (`true` by default)
- `BACKEND_INGRESS`
- `BACKEND_SHADOW_DATABASE_URL`
- `BACKEND_CLOUDSQL_INSTANCES`
- `CLOUD_RUN_BACKEND_MIGRATION_JOB` (defaults to `${CLOUD_RUN_BACKEND_SERVICE}-migrate`)

### Backend database guidance

`BACKEND_DATABASE_URL` must point to a PostgreSQL endpoint that Cloud Run can actually reach.

Unsupported hosts for Cloud Run runtime:

- `db-host`
- `localhost`
- `127.0.0.1`
- `postgres`

These values are valid for local Docker or local development, but they will fail on Cloud Run unless you are using Cloud SQL Unix socket attachment.

Supported patterns:

- External or reachable PostgreSQL host:

```text
BACKEND_DATABASE_URL=postgresql://USER:PASSWORD@db.example.com:5432/ikp_db?schema=public
```

- Cloud SQL with instance attachment:

```text
BACKEND_CLOUDSQL_INSTANCES=PROJECT_ID:REGION:INSTANCE_NAME
BACKEND_DATABASE_URL=postgresql://USER:PASSWORD@/ikp_db?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME&schema=public
```

Notes:

- When using `BACKEND_CLOUDSQL_INSTANCES`, the Cloud Run runtime service account also needs Cloud SQL access, typically `roles/cloudsql.client`.
- If `BACKEND_CLOUDSQL_INSTANCES` is omitted but `BACKEND_DATABASE_URL` contains `host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME`, the deploy script will infer the instance attachment automatically.
- The GitLab variable `BACKEND_DATABASE_URL` is copied into the deployed backend service as `DATABASE_URL`.
- If the pipeline prints `Using backend database host: ...` followed by a local or placeholder host, fix the GitLab CI/CD variable rather than the application code.
- Backend schema migrations now run through a Cloud Run Job before the backend service deploys, so the HTTP container can bind `PORT=8080` immediately instead of blocking on `prisma migrate deploy` during startup.
- The migration job is deployed with `--tasks 1 --parallelism 1 --max-retries 0` so Prisma migrations run once per pipeline execution without automatic retry fan-out.

## Frontend deploy variables

- `CLOUD_RUN_FRONTEND_SERVICE`
- `IMAGE_TAG`
- `BACKEND_URL`

Optional:

- `FRONTEND_IMAGE_NAME` (default `frontend`)
- `FRONTEND_SERVICE_ACCOUNT`
- `FRONTEND_ALLOW_UNAUTHENTICATED` (`true` by default)
- `FRONTEND_INGRESS`

## Important frontend note

`NEXT_PUBLIC_API_BASE_URL` is bundled into the client build. The main GitLab pipeline deploys the backend first, captures the resulting Cloud Run service URL, exports it as `BACKEND_URL`, and then builds the frontend image with that value.

Example:

```bash
/kaniko/executor \
	--context "$CI_PROJECT_DIR/apps/frontend" \
	--dockerfile "$CI_PROJECT_DIR/apps/frontend/Dockerfile" \
	--build-arg "NEXT_PUBLIC_API_BASE_URL=$BACKEND_URL" \
	--destination "$GCP_REGION-docker.pkg.dev/$GCP_PROJECT_ID/$ARTIFACT_REGISTRY_REPOSITORY/frontend:$CI_COMMIT_SHORT_SHA"
```

## GitLab CI usage

Main `.gitlab-ci.yml` now includes Cloud Run jobs directly. Use `infra/cloud-run/gitlab-ci.cloudrun.yml` as an includeable example if you want to split that pipeline logic into a separate file.

The Cloud Run jobs now also:

- push commit-based immutable image tags only
- run backend migrations as a one-off Cloud Run Job before deploying the backend service
- deploy backend before frontend so `BACKEND_URL` is available at frontend build time
- update backend CORS to include the deployed frontend service URL

## Local helper commands

You can invoke the deploy helpers directly when the required environment variables are exported:

```bash
IMAGE_TAG=YOUR_IMAGE_TAG bash infra/cloud-run/deploy-backend-migration-job.sh
IMAGE_TAG=YOUR_IMAGE_TAG bash infra/cloud-run/deploy-backend.sh
IMAGE_TAG=YOUR_IMAGE_TAG bash infra/cloud-run/deploy-frontend.sh
```
