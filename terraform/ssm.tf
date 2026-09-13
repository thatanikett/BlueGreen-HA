resource "aws_ssm_parameter" "database_url" {
  name        = "/bluegreen/database_url"
  description = "Database URL for backend"
  type        = "String"
  value       = "postgres://${aws_db_instance.postgres.username}:${aws_db_instance.postgres.password}@${aws_db_instance.postgres.endpoint}/${aws_db_instance.postgres.db_name}"
}

resource "aws_ssm_parameter" "redis_url" {
  name        = "/bluegreen/redis_url"
  description = "Redis URL for backend"
  type        = "String"
  value       = "redis://${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379"
}
