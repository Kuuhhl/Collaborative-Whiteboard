# --- oidc: deploy identity for the s3 sync / cloudfront invalidation ---
# the github oidc provider is assumed as pre-existing.

data "aws_iam_openid_connect_provider" "github" {
  url = "https://token.actions.githubusercontent.com"
}

data "aws_iam_policy_document" "frontend_deploy_assume" {
  statement {
    actions = ["sts:AssumeRoleWithWebIdentity"]

    principals {
      type        = "Federated"
      identifiers = [data.aws_iam_openid_connect_provider.github.arn]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:aud"
      values   = ["sts.amazonaws.com"]
    }

    condition {
      test     = "StringEquals"
      variable = "token.actions.githubusercontent.com:sub"
      values   = ["repo:${var.github_repository}:environment:production"]
    }
  }
}

# least-privilege permissions for `aws s3 sync --delete` + cache invalidation.
data "aws_iam_policy_document" "frontend_deploy" {
  statement {
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.frontend.arn]
  }

  statement {
    actions = [
      "s3:GetObject",
      "s3:PutObject",
      "s3:DeleteObject",
    ]
    resources = ["${aws_s3_bucket.frontend.arn}/*"]
  }

  statement {
    actions   = ["cloudfront:CreateInvalidation"]
    resources = [aws_cloudfront_distribution.frontend.arn]
  }
}

resource "aws_iam_role" "frontend_deploy" {
  name               = "whiteboard-frontend-deploy"
  description        = "Assumed by GitHub Actions via OIDC to sync the frontend to S3 and invalidate CloudFront."
  assume_role_policy = data.aws_iam_policy_document.frontend_deploy_assume.json
}

resource "aws_iam_role_policy" "frontend_deploy" {
  name   = "frontend-deploy"
  role   = aws_iam_role.frontend_deploy.name
  policy = data.aws_iam_policy_document.frontend_deploy.json
}

resource "aws_iam_role_policies_exclusive" "frontend_deploy" {
  role_name    = aws_iam_role.frontend_deploy.name
  policy_names = [aws_iam_role_policy.frontend_deploy.name]
}
