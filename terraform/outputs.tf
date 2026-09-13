output "vpc_id" {
  value = aws_vpc.main.id
}
output "alb_dns_name" {
  value = aws_lb.app.dns_name
}
output "frontend_bucket_name" {
  value = aws_s3_bucket.frontend.id
}
output "cloudfront_domain" {
  value = aws_cloudfront_distribution.frontend.domain_name
}
output "ecr_repository_url" {
  value = aws_ecr_repository.backend.repository_url
}
output "ecr_repository_name" {
  value = aws_ecr_repository.backend.name
}
output "cloudfront_distribution_id" {
  value = aws_cloudfront_distribution.frontend.id
}
output "codedeploy_app_name" {
  value = aws_codedeploy_app.backend.name
}
output "codedeploy_deployment_group" {
  value = aws_codedeploy_deployment_group.backend.deployment_group_name
}
output "codedeploy_bucket" {
  value = aws_s3_bucket.codedeploy_deployments.id
}
