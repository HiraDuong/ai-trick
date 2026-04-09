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
BACKEND_MIGRATION_JOB="${CLOUD_RUN_BACKEND_MIGRATION_JOB:-${CLOUD_RUN_BACKEND_SERVICE}-migrate}"
migration_service_account="${BACKEND_MIGRATION_SERVICE_ACCOUNT:-${BACKEND_SERVICE_ACCOUNT:-}}"
migration_env_vars="$(build_backend_migration_env_vars)"

configure_backend_gcloud_context

deploy_args=(
	run jobs deploy "$BACKEND_MIGRATION_JOB"
	--image "$BACKEND_IMAGE_URI"
	--region "$GCP_REGION"
	--command npx
	--args prisma,migrate,deploy
)

if [[ -n "$migration_service_account" ]]; then
	deploy_args+=(--service-account "$migration_service_account")
fi

if [[ -n "$effective_cloudsql_instances" ]]; then
	deploy_args+=(--add-cloudsql-instances "$effective_cloudsql_instances")
fi

if [[ -n "$migration_env_vars" ]]; then
	deploy_args+=(--set-env-vars "$migration_env_vars")
fi

echo "Deploying backend migration job: $BACKEND_MIGRATION_JOB"
gcloud "${deploy_args[@]}"

echo "Executing backend migration job: $BACKEND_MIGRATION_JOB"
gcloud run jobs execute "$BACKEND_MIGRATION_JOB" --region "$GCP_REGION" --wait