variable "aws_region" {
  type        = string
  description = "AWS region for the S3 bucket."
}

variable "frontend_bucket_name" {
  type        = string
  description = "Name of the S3 bucket hosting the static frontend."
}

variable "frontend_domain" {
  type        = string
  description = "Custom domain served by CloudFront (matches an existing ACM certificate)."
}

variable "acm_certificate_domain" {
  type        = string
  description = "Domain of the existing (shared, out-of-band) ACM certificate that covers frontend_domain."
}

variable "github_repository" {
  type        = string
  description = "GitHub repository (owner/name) allowed to assume the deploy role via OIDC."
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare zone ID for the DNS zone that hosts frontend_domain."
}
