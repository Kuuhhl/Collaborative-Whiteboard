# --- cloudflare: dns for the custom domain ---

resource "cloudflare_dns_record" "frontend" {
  zone_id = var.cloudflare_zone_id
  name    = var.frontend_domain
  type    = "CNAME"
  content = aws_cloudfront_distribution.frontend.domain_name
  ttl     = 1
  proxied = false
}
