#!/bin/bash
set -e

cd /opt/bluegreen-backend

# Source variables passed from deployment
if [ -f deploy.env ]; then
  source deploy.env
fi

# Fetch IMDSv2 token and region
TOKEN=$(curl -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600" -s)
REGION=$(curl -H "X-aws-ec2-metadata-token: $TOKEN" -s http://169.254.169.254/latest/dynamic/instance-identity/document | grep region | awk -F\" '{print $4}')

# For educational purposes, parameters can be passed via deploy.env or SSM.
# Let's fallback to SSM if not provided.
if [ -z "$DATABASE_URL" ]; then
  DATABASE_URL=$(aws ssm get-parameter --name "/bluegreen/database_url" --with-decryption --region $REGION --query "Parameter.Value" --output text || echo "")
fi

if [ -z "$REDIS_URL" ]; then
  REDIS_URL=$(aws ssm get-parameter --name "/bluegreen/redis_url" --with-decryption --region $REGION --query "Parameter.Value" --output text || echo "")
fi

if [ -z "$APP_VERSION" ]; then
  APP_VERSION="V1"
fi

if [ -z "$IMAGE_URI" ]; then
  echo "IMAGE_URI is not set in deploy.env!"
  exit 1
fi

echo "Pulling Docker image: $IMAGE_URI"
docker pull $IMAGE_URI

echo "Starting backend container"
docker run -d --name backend \
  --restart unless-stopped \
  -p 8080:8080 \
  -e DATABASE_URL="$DATABASE_URL" \
  -e REDIS_URL="$REDIS_URL" \
  -e APP_VERSION="$APP_VERSION" \
  -e PG_SSL_MODE="require" \
  $IMAGE_URI
