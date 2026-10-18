# --- oidc: github actions workload identity federation ---

# this pool we assume to already exist
data "google_iam_workload_identity_pool" "github" {
  workload_identity_pool_id = var.github_oidc_pool_id
}

data "google_iam_workload_identity_pool_provider" "github" {
  workload_identity_pool_id          = data.google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = var.github_oidc_provider_id
}

locals {
  # Require the production environment; the existing provider must map
  # google.subject = assertion.sub and restrict refs to main.
  github_principal = "principal://iam.googleapis.com/${data.google_iam_workload_identity_pool.github.name}/subject/repo:${var.github_repository}:environment:production"
}

# service account the cloud run revision runs as (least privilege).
resource "google_service_account" "backend" {
  account_id   = "whiteboard-backend"
  display_name = "Collaborative Whiteboard backend"
}

# grant deploy permissions directly (no deployer service account).
resource "google_project_iam_member" "github_run_developer" {
  project = var.gcp_project_id
  role    = "roles/run.developer"
  member  = local.github_principal
}

resource "google_service_account_iam_member" "github_act_as_backend" {
  service_account_id = google_service_account.backend.name
  role               = "roles/iam.serviceAccountUser"
  member             = local.github_principal
}

# --- cloud run service (backend) ---

resource "google_cloud_run_v2_service" "backend" {
  name                = "whiteboard-backend"
  location            = var.gcp_region
  deletion_protection = false
  ingress             = "INGRESS_TRAFFIC_ALL"

  # scale to zero: no instances when idle, at most one when in use.
  scaling {
    min_instance_count = 0
    max_instance_count = 1
  }

  # don't keep image in state,
  # since that will be changed by provisioning later
  lifecycle {
    ignore_changes = [
      template[0].containers[0].image,
    ]
  }

  template {
    timeout         = "3600s" # we time out websockets only after an hour
    service_account = google_service_account.backend.email

    containers {
      image = var.backend_image

      ports {
        container_port = 39291
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
        cpu_idle = true
      }

      env {
        name  = "MONGO_DB_URL"
        value = local.mongo_db_url
      }
      env {
        name  = "MONGO_DB_NAME"
        value = local.mongo_db_name
      }
      env {
        name  = "REDIS_HOST"
        value = upstash_redis_database.redis.endpoint
      }
      env {
        name  = "REDIS_PORT"
        value = tostring(upstash_redis_database.redis.port)
      }
      env {
        name  = "REDIS_PASSWORD"
        value = upstash_redis_database.redis.password
      }
      env {
        name  = "FRONTEND_BASE_URL"
        value = var.frontend_base_url
      }
    }
  }
}

# make the backend publicly invokable by the frontend.
resource "google_cloud_run_v2_service_iam_member" "public" {
  name     = google_cloud_run_v2_service.backend.name
  location = google_cloud_run_v2_service.backend.location
  project  = var.gcp_project_id
  role     = "roles/run.invoker"
  member   = "allUsers"
}
