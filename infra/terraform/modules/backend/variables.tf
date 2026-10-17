# --- google cloud ---

variable "gcp_project_id" {
  type        = string
  description = "Google Cloud project ID."
}

variable "gcp_region" {
  type        = string
  description = "Google Cloud region for the Cloud Run service."
}

variable "backend_image" {
  type        = string
  description = "Container image for the backend. Pushed by the docker-image-backend.yml workflow."
}

variable "frontend_base_url" {
  type        = string
  description = "Public base URL of the frontend, used for CORS and cookie origin checks."
}

variable "backend_domain" {
  type        = string
  description = "Custom domain served by the backend Cloud Run service."
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare zone ID hosting backend_domain."
}

variable "github_repository" {
  type        = string
  description = "GitHub repository (owner/name) allowed to assume the deploy identity via OIDC."
}

variable "github_oidc_pool_id" {
  type        = string
  description = "ID of the existing GCP workload identity pool GitHub Actions authenticates through."
}

variable "github_oidc_provider_id" {
  type        = string
  description = "ID of the OIDC provider inside the workload identity pool."
}

# --- mongodb atlas ---

variable "atlas_org_id" {
  type        = string
  description = "MongoDB Atlas organization ID."
}

variable "atlas_region" {
  type        = string
  description = "MongoDB Atlas AWS region supporting M0, in Atlas format (for example EU_WEST_1)."
}

# --- upstash ---

variable "upstash_email" {
  type        = string
  description = "Upstash account email."
}

variable "upstash_api_key" {
  type        = string
  description = "Upstash API key."
  sensitive   = true
}

# --- infisical ---

variable "infisical_project_id" {
  type        = string
  description = "Infisical project ID."
}

variable "infisical_env_slug" {
  type        = string
  description = "Infisical environment slug."
}

variable "infisical_client_id" {
  type        = string
  description = "Infisical machine identity client ID."
  sensitive   = true
}

variable "infisical_client_secret" {
  type        = string
  description = "Infisical machine identity client secret."
  sensitive   = true
}
