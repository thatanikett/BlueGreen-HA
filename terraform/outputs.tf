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
