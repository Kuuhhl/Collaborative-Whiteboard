output "frontend_bucket_name" {
  description = "S3 bucket name the frontend deploy workflow syncs into."
  value       = aws_s3_bucket.frontend.bucket
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID the frontend deploy workflow invalidates."
  value       = aws_cloudfront_distribution.frontend.id
}

output "frontend_deploy_role_arn" {
  description = "ARN of the IAM role the deploy workflow assumes via OIDC to sync S3 and invalidate CloudFront."
  value       = aws_iam_role.frontend_deploy.arn
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name (the CNAME target for frontend_domain)."
  value       = aws_cloudfront_distribution.frontend.domain_name
}
