# --- google cloud ---

variable "gcp_project_id" {
  type        = string
  description = "Google Cloud project ID."
  default     = ""
}

variable "gcp_region" {
  type        = string
  description = "Google Cloud region for the Cloud Run service."
  default     = "europe-west1"
}

variable "backend_image" {
  type        = string
  description = "Container image for the backend. Pushed by the docker-image-backend.yml workflow."
  default     = "ghcr.io/kuuhhl/collaborative-whiteboard-backend:latest"
}

variable "frontend_base_url" {
  type        = string
  description = "Public base URL of the frontend, used for CORS and cookie origin checks."
  default     = "https://whiteboard.landmann.ph"
}

variable "backend_domain" {
  type        = string
  description = "Custom domain served by the backend Cloud Run service."
  default     = "backend.whiteboard.landmann.ph"
}

variable "github_repository" {
  type        = string
  description = "GitHub repository (owner/name) allowed to assume the deploy identity via OIDC."
  default     = "Kuuhhl/Collaborative-Whiteboard"
}

variable "github_oidc_pool_id" {
  type        = string
  description = "ID of the existing GCP workload identity pool GitHub Actions authenticates through."
  default     = "collaborative-whiteboard-cd"
}

variable "github_oidc_provider_id" {
  type        = string
  description = "ID of the OIDC provider inside the workload identity pool."
  default     = "github"
}

# --- aws (static site) ---

variable "aws_region" {
  type        = string
  description = "AWS region for the S3 bucket."
  default     = "eu-west-1"
}

variable "frontend_bucket_name" {
  type        = string
  description = "Name of the S3 bucket hosting the static frontend."
  default     = "collaborative-whiteboard-frontend"
}

variable "frontend_domain" {
  type        = string
  description = "Custom domain served by CloudFront (matches an existing ACM certificate)."
  default     = "whiteboard.landmann.ph"
}

variable "acm_certificate_domain" {
  type        = string
  description = "Domain name of the existing (shared, out-of-band) ACM certificate to look up. Must cover frontend_domain."
  default     = "landmann.ph"
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API token scoped to DNS:Edit on the target zone. Provided via Infisical."
  sensitive   = true
  default     = ""
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare zone ID hosting frontend_domain."
  default     = "30d3925327557aa4c0bb7cf2f4713ae0"
}

# --- mongodb atlas ---

variable "atlas_org_id" {
  type        = string
  description = "MongoDB Atlas organization ID."
  default     = ""
}

variable "atlas_region" {
  type        = string
  description = "MongoDB Atlas AWS region supporting M0, in Atlas format (for example EU_WEST_1)."
  default     = "EU_WEST_1"
}

variable "atlas_public_key" {
  type        = string
  description = "MongoDB Atlas programmatic access key (public key)."
  sensitive   = true
  default     = ""
}

variable "atlas_private_key" {
  type        = string
  description = "MongoDB Atlas programmatic access key (private key)."
  sensitive   = true
  default     = ""
}

# --- upstash ---

variable "upstash_email" {
  type        = string
  description = "Upstash account email."
  default     = ""
}

variable "upstash_api_key" {
  type        = string
  description = "Upstash API key."
  sensitive   = true
  default     = ""
}

# --- infisical ---

variable "infisical_project_id" {
  type        = string
  description = "Infisical project ID."
  default     = ""
}

variable "infisical_env_slug" {
  type        = string
  description = "Infisical environment slug."
  default     = "prod"
}

variable "infisical_client_id" {
  type        = string
  description = "Infisical machine identity client ID."
  sensitive   = true
  default     = ""
}

variable "infisical_client_secret" {
  type        = string
  description = "Infisical machine identity client secret."
  sensitive   = true
  default     = ""
}
