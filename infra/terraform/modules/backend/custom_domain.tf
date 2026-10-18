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
  proxied = true
}

# full ssl mode ensures cloudflare connects to ghs.googlehosted.com via https
resource "cloudflare_zone_setting" "ssl" {
  zone_id    = var.cloudflare_zone_id
  setting_id = "ssl"
  value      = "full"
}


resource "cloudflare_ruleset" "backend_waf" {
  zone_id     = var.cloudflare_zone_id
  name        = "Block backend vulnerability scans"
  description = "Block common scanner paths at Cloudflare edge to prevent waking Cloud Run"
  kind        = "zone"
  phase       = "http_request_firewall_custom"

  rules = [
    {
      action      = "block"
      description = "Block unknown paths on backend domain"
      expression  = "(http.host eq \"${var.backend_domain}\" and not http.request.uri.path in {\"/\" \"/ping\" \"/createRoom\" \"/joinRoom\"} and not starts_with(http.request.uri.path, \"/socket.io/\"))"
      enabled     = true
    }
  ]
}

