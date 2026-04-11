#!/usr/bin/env bash
# Luvina
# Vu Huy Hoang - Dev2

require_backend_base_env() {
	: "${GCP_PROJECT_ID:?GCP_PROJECT_ID is required}"
	: "${GCP_REGION:?GCP_REGION is required}"
	: "${ARTIFACT_REGISTRY_REPOSITORY:?ARTIFACT_REGISTRY_REPOSITORY is required}"
	: "${IMAGE_TAG:?IMAGE_TAG is required}"
	: "${BACKEND_DATABASE_URL:?BACKEND_DATABASE_URL is required}"
}

require_backend_service_env() {
	require_backend_base_env
	: "${BACKEND_JWT_SECRET:?BACKEND_JWT_SECRET is required}"
}

infer_backend_cloudsql_instances() {
	local cloudsql_instance_from_url=""

	if [[ "$BACKEND_DATABASE_URL" == *"host=/cloudsql/"* ]]; then
		cloudsql_instance_from_url="${BACKEND_DATABASE_URL#*host=/cloudsql/}"
		cloudsql_instance_from_url="${cloudsql_instance_from_url%%&*}"
	fi

	printf '%s' "${BACKEND_CLOUDSQL_INSTANCES:-$cloudsql_instance_from_url}"
}

read_backend_database_host() {
	local database_host="${BACKEND_DATABASE_URL#*://}"
	database_host="${database_host#*@}"
	database_host="${database_host%%[/?]*}"
	database_host="${database_host%%:*}"

	printf '%s' "$database_host"
}

validate_backend_database_config() {
	local database_host="$1"
	local effective_cloudsql_instances="$2"

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
}

build_backend_image_uri() {
	local backend_image_name="${BACKEND_IMAGE_NAME:-backend}"
	local gar_host="${GCP_REGION}-docker.pkg.dev"

	printf '%s' "${gar_host}/${GCP_PROJECT_ID}/${ARTIFACT_REGISTRY_REPOSITORY}/${backend_image_name}:${IMAGE_TAG}"
}

configure_backend_gcloud_context() {
	gcloud config set project "$GCP_PROJECT_ID" >/dev/null
	gcloud config set run/region "$GCP_REGION" >/dev/null
}

build_backend_service_env_vars() {
	local env_vars=("NODE_ENV=production" "HOST=0.0.0.0" "DATABASE_URL=${BACKEND_DATABASE_URL}" "JWT_SECRET=${BACKEND_JWT_SECRET}")

	if [[ -n "${BACKEND_SHADOW_DATABASE_URL:-}" ]]; then
		env_vars+=("SHADOW_DATABASE_URL=${BACKEND_SHADOW_DATABASE_URL}")
	fi

	if [[ -n "${BACKEND_CORS_ORIGIN:-}" ]]; then
		env_vars+=("CORS_ORIGIN=${BACKEND_CORS_ORIGIN}")
	fi

	if [[ -n "${BACKEND_JWT_EXPIRES_IN:-}" ]]; then
		env_vars+=("JWT_EXPIRES_IN=${BACKEND_JWT_EXPIRES_IN}")
	fi

	local joined
	printf -v joined '##%s' "${env_vars[@]}"
	printf '%s' "^##^${joined:2}"
}

build_backend_migration_env_vars() {
	local env_vars=("NODE_ENV=production" "DATABASE_URL=${BACKEND_DATABASE_URL}")

	if [[ -n "${BACKEND_SHADOW_DATABASE_URL:-}" ]]; then
		env_vars+=("SHADOW_DATABASE_URL=${BACKEND_SHADOW_DATABASE_URL}")
	fi

	local joined
	printf -v joined '##%s' "${env_vars[@]}"
	printf '%s' "^##^${joined:2}"
}