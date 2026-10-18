# providers are configured here at the root and inherited by the child modules.

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

provider "aws" {
  region = var.aws_region
}

# CloudFront only accepts ACM certificates issued in us-east-1, regardless of
# where the S3 bucket lives, so the certificate is looked up with this alias.
provider "aws" {
  alias  = "us_east_1"
  region = "us-east-1"
}

# requires dns edit permissions in the zone
provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

provider "mongodbatlas" {
  public_key  = var.atlas_public_key
  private_key = var.atlas_private_key
}

provider "upstash" {
  email   = var.upstash_email
  api_key = var.upstash_api_key
}

provider "infisical" {
  host = "https://app.infisical.com"
  auth = {
    universal = {
      client_id     = var.infisical_client_id
      client_secret = var.infisical_client_secret
    }
  }
}
