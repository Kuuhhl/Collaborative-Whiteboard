output "backend_url" {
  description = "Public HTTPS URL of the backend custom domain."
  value       = module.backend.backend_url
}

output "mongo_db_url" {
  description = "MongoDB Atlas connection string (with generated credentials)."
  value       = module.backend.mongo_db_url
  sensitive   = true
}

output "redis_endpoint" {
  description = "Upstash Redis endpoint (host)."
  value       = module.backend.redis_endpoint
}

output "redis_port" {
  description = "Upstash Redis port."
  value       = module.backend.redis_port
}

output "redis_password" {
  description = "Upstash Redis password."
  value       = module.backend.redis_password
  sensitive   = true
}

output "github_workload_identity_provider" {
  description = "Fully-qualified name of the GitHub OIDC workload identity provider."
  value       = module.backend.github_workload_identity_provider
}

output "frontend_bucket_name" {
  description = "S3 bucket name the frontend deploy workflow syncs into."
  value       = module.frontend.frontend_bucket_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID the frontend deploy workflow invalidates."
  value       = module.frontend.cloudfront_distribution_id
}

output "frontend_deploy_role_arn" {
  description = "ARN of the IAM role the deploy workflow assumes via OIDC to sync S3 and invalidate CloudFront."
  value       = module.frontend.frontend_deploy_role_arn
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (the CNAME target for frontend_domain)."
  value       = module.frontend.cloudfront_domain_name
}
