output "backend_url" {
  description = "Public HTTPS URL of the backend custom domain."
  value       = "https://${var.backend_domain}"
}

output "mongo_db_url" {
  description = "MongoDB Atlas connection string (with generated credentials)."
  value       = local.mongo_db_url
  sensitive   = true
}

output "redis_endpoint" {
  description = "Upstash Redis endpoint (host)."
  value       = upstash_redis_database.redis.endpoint
}

output "redis_port" {
  description = "Upstash Redis port."
  value       = upstash_redis_database.redis.port
}

output "redis_password" {
  description = "Upstash Redis password."
  value       = upstash_redis_database.redis.password
  sensitive   = true
}

output "github_workload_identity_provider" {
  description = "Fully-qualified name of the GitHub OIDC workload identity provider."
  value       = data.google_iam_workload_identity_pool_provider.github.name
}
