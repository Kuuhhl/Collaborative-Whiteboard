terraform {
  cloud {
    workspaces {
      name = "collaborative-whiteboard-demo"
    }
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.13"
    }
    google = {
      source  = "hashicorp/google"
      version = "8.6.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3"
    }
    mongodbatlas = {
      source  = "mongodb/mongodbatlas"
      version = "2.19.0"
    }
    upstash = {
      source  = "upstash/upstash"
      version = "2.1.0"
    }
    infisical = {
      source  = "infisical/infisical"
      version = "~> 0.15.0"
    }
  }
}

module "backend" {
  source = "./modules/backend"

  gcp_project_id          = var.gcp_project_id
  gcp_region              = var.gcp_region
  backend_image           = var.backend_image
  frontend_base_url       = var.frontend_base_url
  backend_domain          = var.backend_domain
  cloudflare_zone_id      = var.cloudflare_zone_id
  github_repository       = var.github_repository
  github_oidc_pool_id     = var.github_oidc_pool_id
  github_oidc_provider_id = var.github_oidc_provider_id

  atlas_org_id = var.atlas_org_id
  atlas_region = var.atlas_region

  upstash_email   = var.upstash_email
  upstash_api_key = var.upstash_api_key

  infisical_project_id    = var.infisical_project_id
  infisical_env_slug      = var.infisical_env_slug
  infisical_client_id     = var.infisical_client_id
  infisical_client_secret = var.infisical_client_secret
}

module "frontend" {
  source = "./modules/frontend"

  providers = {
    aws.us_east_1 = aws.us_east_1
  }

  aws_region             = var.aws_region
  frontend_bucket_name   = var.frontend_bucket_name
  frontend_domain        = var.frontend_domain
  acm_certificate_domain = var.acm_certificate_domain
  github_repository      = var.github_repository
  cloudflare_zone_id     = var.cloudflare_zone_id
}
