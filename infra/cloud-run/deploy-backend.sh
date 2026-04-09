#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=infra/cloud-run/backend-deploy-common.sh
source "$SCRIPT_DIR/backend-deploy-common.sh"

require_backend_service_env

: "${CLOUD_RUN_BACKEND_SERVICE:=backend-service}"

effective_cloudsql_instances="$(infer_backend_cloudsql_instances)"
database_host="$(read_backend_database_host)"
validate_backend_database_config "$database_host" "$effective_cloudsql_instances"

BACKEND_IMAGE_URI="$(build_backend_image_uri)"

configure_backend_gcloud_context

deploy_args=(
	run deploy "$CLOUD_RUN_BACKEND_SERVICE"
	--image "$BACKEND_IMAGE_URI"
	--platform managed
	--region "$GCP_REGION"
	--port 8080
)

if [[ "${BACKEND_ALLOW_UNAUTHENTICATED:-true}" == "true" ]]; then
	deploy_args+=(--allow-unauthenticated)
else
	deploy_args+=(--no-allow-unauthenticated)
fi

if [[ -n "${BACKEND_SERVICE_ACCOUNT:-}" ]]; then
	deploy_args+=(--service-account "$BACKEND_SERVICE_ACCOUNT")
fi

if [[ -n "${BACKEND_INGRESS:-}" ]]; then
	deploy_args+=(--ingress "$BACKEND_INGRESS")
fi

if [[ -n "$effective_cloudsql_instances" ]]; then
	deploy_args+=(--add-cloudsql-instances "$effective_cloudsql_instances")
fi

service_env_vars="$(build_backend_service_env_vars)"

if [[ -n "$service_env_vars" ]]; then
	deploy_args+=(--set-env-vars "$service_env_vars")
fi

gcloud "${deploy_args[@]}"
