# app-level secrets generated here and pushed to Infisical for the frontend / CI.
# we push them to the /dynamic folder to seperate them from the manually input static secrets.

resource "infisical_secret" "mongo_db_url" {
  name         = "MONGO_DB_URL"
  value        = local.mongo_db_url
  env_slug     = var.infisical_env_slug
  workspace_id = var.infisical_project_id
  folder_path  = "/dynamic"
}

resource "infisical_secret" "mongo_db_name" {
  name         = "MONGO_DB_NAME"
  value        = local.mongo_db_name
  env_slug     = var.infisical_env_slug
  workspace_id = var.infisical_project_id
  folder_path  = "/dynamic"
}

resource "infisical_secret" "redis_host" {
  name         = "REDIS_HOST"
  value        = upstash_redis_database.redis.endpoint
  env_slug     = var.infisical_env_slug
  workspace_id = var.infisical_project_id
  folder_path  = "/dynamic"
}

resource "infisical_secret" "redis_port" {
  name         = "REDIS_PORT"
  value        = tostring(upstash_redis_database.redis.port)
  env_slug     = var.infisical_env_slug
  workspace_id = var.infisical_project_id
  folder_path  = "/dynamic"
}

resource "infisical_secret" "redis_password" {
  name         = "REDIS_PASSWORD"
  value        = upstash_redis_database.redis.password
  env_slug     = var.infisical_env_slug
  workspace_id = var.infisical_project_id
  folder_path  = "/dynamic"
}

resource "infisical_secret" "backend_base_url" {
  name         = "BACKEND_BASE_URL"
  value        = "https://${var.backend_domain}"
  env_slug     = var.infisical_env_slug
  workspace_id = var.infisical_project_id
  folder_path  = "/dynamic"
}
