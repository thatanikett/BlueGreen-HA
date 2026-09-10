#!/bin/bash
set -e

cd /opt/bluegreen-backend

# Fetch IMDSv2 token and region
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" -s)
REGION=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/dynamic/instance-identity/document | grep region | awk -F\" '{print $4}')

# Fetch DATABASE_URL from SSM
DATABASE_URL=$(aws ssm get-parameter --name "/bluegreen/database_url" --with-decryption --region $REGION --query "Parameter.Value" --output text || echo "")

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set in SSM. Cannot run migrations."
  exit 1
fi

# Extract DB connection details from DATABASE_URL
# Format: postgres://username:password@host:port/dbname
# Strip "postgres://"
CRED_HOST=${DATABASE_URL#postgres://}
# Extract username:password and host:port/dbname
CRED=${CRED_HOST%%@*}
HOST_DB=${CRED_HOST#*@}
# Extract user and pass
DB_USER=${CRED%%:*}
DB_PASS=${CRED#*:}
# Extract host and db
DB_HOST_PORT=${HOST_DB%%/*}
DB_NAME=${HOST_DB#*/}

JDBC_URL="jdbc:postgresql://${DB_HOST_PORT}/${DB_NAME}"

echo "Running Flyway migrations against $JDBC_URL..."

docker run --rm \
  -v $(pwd)/migrations:/flyway/sql \
  flyway/flyway:9-alpine \
  -url="$JDBC_URL" \
  -user="$DB_USER" \
  -password="$DB_PASS" \
  migrate

echo "Flyway migrations completed successfully!"
