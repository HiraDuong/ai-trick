#!/usr/bin/env bash
# Chạy trên máy chủ qua SSH từ GitLab CI, hoặc chạy tay với biến môi trường đã export.
# Yêu cầu: Docker + plugin Compose, thư mục /opt/ikp với docker-compose.prod.yml và .env.
set -euo pipefail

: "${CI_REGISTRY:?}"
: "${CI_REGISTRY_IMAGE:?}"
: "${CI_COMMIT_SHORT_SHA:?}"
: "${CI_REGISTRY_USER:?}"
: "${CI_REGISTRY_PASSWORD:?}"

echo "$CI_REGISTRY_PASSWORD" | docker login -u "$CI_REGISTRY_USER" --password-stdin "$CI_REGISTRY"

export BACKEND_IMAGE="${CI_REGISTRY_IMAGE}/backend"
export FRONTEND_IMAGE="${CI_REGISTRY_IMAGE}/frontend"
export IMAGE_TAG="${CI_COMMIT_SHORT_SHA}"

DEPLOY_DIR="${DEPLOY_DIR:-/opt/ikp}"

cd "$DEPLOY_DIR"
docker compose --env-file .env -f docker-compose.prod.yml pull
docker compose --env-file .env -f docker-compose.prod.yml up -d --remove-orphans

docker compose --env-file .env -f docker-compose.prod.yml ps
