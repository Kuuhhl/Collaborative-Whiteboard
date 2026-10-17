resource "upstash_redis_database" "redis" {
  database_name  = "collaborative-whiteboard"
  region         = "global"
  primary_region = "eu-west-1"
  tls            = true
  eviction       = true # evict keys at max size
}
