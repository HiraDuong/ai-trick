#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?GCP_PROJECT_ID is required}"
: "${GCP_REGION:?GCP_REGION is required}"
: "${ARTIFACT_REGISTRY_REPOSITORY:?ARTIFACT_REGISTRY_REPOSITORY is required}"
: "${CLOUD_RUN_FRONTEND_SERVICE:=frontend-service}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"

if [[ -z "${NEXT_PUBLIC_API_BASE_URL:-}" && -n "${BACKEND_URL:-}" ]]; then
  NEXT_PUBLIC_API_BASE_URL="$BACKEND_URL"
fi

FRONTEND_IMAGE_NAME="${FRONTEND_IMAGE_NAME:-frontend}"
GAR_HOST="${GCP_REGION}-docker.pkg.dev"
FRONTEND_IMAGE_URI="${GAR_HOST}/${GCP_PROJECT_ID}/${ARTIFACT_REGISTRY_REPOSITORY}/${FRONTEND_IMAGE_NAME}:${IMAGE_TAG}"

gcloud config set project "$GCP_PROJECT_ID" >/dev/null
gcloud config set run/region "$GCP_REGION" >/dev/null

deploy_args=(
  run deploy "$CLOUD_RUN_FRONTEND_SERVICE"
  --image "$FRONTEND_IMAGE_URI"
  --platform managed
  --region "$GCP_REGION"
  --port 8080
)

if [[ "${FRONTEND_ALLOW_UNAUTHENTICATED:-true}" == "true" ]]; then
  deploy_args+=(--allow-unauthenticated)
else
  deploy_args+=(--no-allow-unauthenticated)
fi

if [[ -n "${FRONTEND_SERVICE_ACCOUNT:-}" ]]; then
  deploy_args+=(--service-account "$FRONTEND_SERVICE_ACCOUNT")
fi

if [[ -n "${FRONTEND_INGRESS:-}" ]]; then
  deploy_args+=(--ingress "$FRONTEND_INGRESS")
fi

env_vars=("NODE_ENV=production" "HOSTNAME=0.0.0.0" "PORT=8080")

if [[ -n "${NEXT_PUBLIC_API_BASE_URL:-}" ]]; then
  env_vars+=("NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}")
fi

if (( ${#env_vars[@]} > 0 )); then
  deploy_args+=(--set-env-vars "$(IFS=,; echo "${env_vars[*]}")")
fi

gcloud "${deploy_args[@]}"