#!/usr/bin/env bash
# Luvina
# Vu Huy Hoang - Dev2
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=infra/cloud-run/backend-deploy-common.sh
source "$SCRIPT_DIR/backend-deploy-common.sh"

require_backend_base_env

: "${CLOUD_RUN_BACKEND_SERVICE:=backend-service}"

effective_cloudsql_instances="$(infer_backend_cloudsql_instances)"
database_host="$(read_backend_database_host)"
validate_backend_database_config "$database_host" "$effective_cloudsql_instances"

BACKEND_IMAGE_URI="$(build_backend_image_uri)"
BACKEND_SEED_JOB="${CLOUD_RUN_BACKEND_SEED_JOB:-${CLOUD_RUN_BACKEND_SERVICE}-seed}"
seed_service_account="${BACKEND_SEED_SERVICE_ACCOUNT:-${BACKEND_SERVICE_ACCOUNT:-}}"
seed_env_vars="$(build_backend_migration_env_vars)"

configure_backend_gcloud_context

deploy_args=(
	run jobs deploy "$BACKEND_SEED_JOB"
	--image "$BACKEND_IMAGE_URI"
	--region "$GCP_REGION"
	--tasks 1
	--parallelism 1
	--max-retries 0
	--command node
	--args dist/scripts/seed-production.js
)

if [[ -n "$seed_service_account" ]]; then
	deploy_args+=(--service-account "$seed_service_account")
fi

if [[ -n "$effective_cloudsql_instances" ]]; then
	deploy_args+=(--set-cloudsql-instances "$effective_cloudsql_instances")
fi

if [[ -n "$seed_env_vars" ]]; then
	deploy_args+=(--set-env-vars "$seed_env_vars")
fi

echo "Deploying backend seed job: $BACKEND_SEED_JOB"
gcloud "${deploy_args[@]}"

echo "Executing backend seed job: $BACKEND_SEED_JOB"
gcloud run jobs execute "$BACKEND_SEED_JOB" --region "$GCP_REGION" --wait
