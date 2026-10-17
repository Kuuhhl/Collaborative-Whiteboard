terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
    }
    random = {
      source = "hashicorp/random"
    }
    mongodbatlas = {
      source = "mongodb/mongodbatlas"
    }
    upstash = {
      source = "upstash/upstash"
    }
    infisical = {
      source = "infisical/infisical"
    }
    cloudflare = {
      source = "cloudflare/cloudflare"
    }
  }
}
