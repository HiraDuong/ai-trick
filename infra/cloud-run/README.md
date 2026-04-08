# Cloud Run Deployment

This directory contains additive deployment helpers for running the frontend and backend on Google Cloud Run using Google Artifact Registry images.

## Services

- Frontend Cloud Run service: Next.js production server listening on `0.0.0.0:${PORT}`
- Backend Cloud Run service: compiled Express + Prisma server listening on `0.0.0.0:${PORT}`

Both Dockerfiles now default to `PORT=8080`, which matches Cloud Run expectations.

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
- `BACKEND_ALLOW_UNAUTHENTICATED` (`true` by default)
- `BACKEND_INGRESS`
- `BACKEND_SHADOW_DATABASE_URL`

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

`NEXT_PUBLIC_API_BASE_URL` is bundled into the client build. The main GitLab pipeline now deploys the backend first, captures the resulting Cloud Run service URL, exports it as `BACKEND_URL`, and then builds the frontend image with that value.

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
Use `infra/cloud-run/gitlab-ci.cloudrun.yml` as an includeable example for:

- Kaniko image builds to Artifact Registry
- `gcloud run deploy` for backend
- `gcloud run deploy` for frontend

## Local helper commands

- `npm run deploy:cloudrun:backend`
- `npm run deploy:cloudrun:frontend`