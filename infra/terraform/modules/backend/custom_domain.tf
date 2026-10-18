# --- custom domain: backend.whiteboard.landmann.ph ---------------------------
# before provisioning, the domain has to be verified in google search console.

resource "google_cloud_run_domain_mapping" "backend" {
  location = var.gcp_region
  name     = var.backend_domain

  metadata {
    namespace = var.gcp_project_id
  }

  spec {
    route_name = google_cloud_run_v2_service.backend.name
  }
}

resource "cloudflare_dns_record" "backend" {
  zone_id = var.cloudflare_zone_id
  name    = var.backend_domain
  type    = "CNAME"
  content = "ghs.googlehosted.com"
  ttl     = 1
  proxied = false
}
