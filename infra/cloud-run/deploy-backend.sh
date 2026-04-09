#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?GCP_PROJECT_ID is required}"
: "${GCP_REGION:?GCP_REGION is required}"
: "${ARTIFACT_REGISTRY_REPOSITORY:?ARTIFACT_REGISTRY_REPOSITORY is required}"
: "${CLOUD_RUN_BACKEND_SERVICE:=backend-service}"
: "${IMAGE_TAG:?IMAGE_TAG is required}"
: "${BACKEND_DATABASE_URL:?BACKEND_DATABASE_URL is required}"
: "${BACKEND_JWT_SECRET:?BACKEND_JWT_SECRET is required}"

cloudsql_instance_from_url=""

if [[ "$BACKEND_DATABASE_URL" == *"host=/cloudsql/"* ]]; then
	cloudsql_instance_from_url="${BACKEND_DATABASE_URL#*host=/cloudsql/}"
	cloudsql_instance_from_url="${cloudsql_instance_from_url%%&*}"
fi

effective_cloudsql_instances="${BACKEND_CLOUDSQL_INSTANCES:-$cloudsql_instance_from_url}"

database_host="${BACKEND_DATABASE_URL#*://}"
database_host="${database_host#*@}"
database_host="${database_host%%[/?]*}"
database_host="${database_host%%:*}"

echo "Using backend database host: ${database_host:-unknown}"

if [[ -n "$effective_cloudsql_instances" ]]; then
	echo "Using Cloud SQL instance attachment: $effective_cloudsql_instances"
fi

case "$database_host" in
	db-host|postgres)
		echo "BACKEND_DATABASE_URL uses unsupported Cloud Run host '$database_host'. Update GitLab variable BACKEND_DATABASE_URL to a reachable PostgreSQL host." >&2
		exit 1
		;;
	localhost|127.0.0.1)
		if [[ -z "$effective_cloudsql_instances" ]]; then
			echo "BACKEND_DATABASE_URL uses local host '$database_host' without Cloud SQL attachment. Set BACKEND_CLOUDSQL_INSTANCES or use a reachable PostgreSQL host." >&2
			exit 1
		fi
		;;
	"")
		if [[ -z "$effective_cloudsql_instances" ]]; then
			echo "BACKEND_DATABASE_URL has no hostname and no Cloud SQL socket attachment. Set BACKEND_CLOUDSQL_INSTANCES or use a reachable PostgreSQL host." >&2
			exit 1
		fi
		;;
esac

BACKEND_IMAGE_NAME="${BACKEND_IMAGE_NAME:-backend}"
GAR_HOST="${GCP_REGION}-docker.pkg.dev"
BACKEND_IMAGE_URI="${GAR_HOST}/${GCP_PROJECT_ID}/${ARTIFACT_REGISTRY_REPOSITORY}/${BACKEND_IMAGE_NAME}:${IMAGE_TAG}"

gcloud config set project "$GCP_PROJECT_ID" >/dev/null
gcloud config set run/region "$GCP_REGION" >/dev/null

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

env_vars=("NODE_ENV=production" "HOST=0.0.0.0" "DATABASE_URL=${BACKEND_DATABASE_URL}" "JWT_SECRET=${BACKEND_JWT_SECRET}")

if [[ -n "${BACKEND_SHADOW_DATABASE_URL:-}" ]]; then
	env_vars+=("SHADOW_DATABASE_URL=${BACKEND_SHADOW_DATABASE_URL}")
fi

if [[ -n "${BACKEND_CORS_ORIGIN:-}" ]]; then
	env_vars+=("CORS_ORIGIN=${BACKEND_CORS_ORIGIN}")
fi

if [[ -n "${BACKEND_JWT_EXPIRES_IN:-}" ]]; then
	env_vars+=("JWT_EXPIRES_IN=${BACKEND_JWT_EXPIRES_IN}")
fi

if (( ${#env_vars[@]} > 0 )); then
	deploy_args+=(--set-env-vars "$(IFS=,; echo "${env_vars[*]}")")
fi

gcloud "${deploy_args[@]}"
