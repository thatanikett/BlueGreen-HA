# BlueGreen-HA

Highly Available Architecture with Automated blue-green Deployment on AWS.

## Architecture Overview
- **Frontend**: React application hosted on S3 and distributed globally via CloudFront.
- **Backend**: Node.js/Express API running on EC2 instances managed by an Auto Scaling Group in private subnets across multiple Availability Zones.
- **Load Balancing**: Application Load Balancer (ALB) across public subnets, forwarding traffic to the backend instances.
- **Database**: Amazon RDS PostgreSQL in Multi-AZ configuration (Private DB subnets).
- **Cache/Session**: Amazon ElastiCache (Redis) for managing shared application state and shopping carts (Private DB subnets).
- **Deployment**: AWS CodeDeploy utilizing EC2 blue-green deployments to minimize downtime and ensure safe rollouts.

## Local Development
Local development environment relies on `docker-compose.yml` which stands up:
- PostgreSQL (port 5433)
- Redis (port 6379)
- Frontend (port 80)
- Backend (port 8080)
- Flyway (for database migrations)

Start it with:
```bash
docker compose up --build
```

## Infrastructure (Terraform)
The infrastructure is defined declaratively using Terraform in the `terraform/` directory.

To deploy:
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

## CI/CD Pipelines
GitHub Actions are configured in `.github/workflows/`:
- `frontend.yml`: Builds and syncs frontend assets to S3 and invalidates CloudFront cache.
- `backend.yml`: Builds Docker image, pushes to ECR, and triggers CodeDeploy blue-green deployment on EC2.
- `terraform.yml`: Validates and applies Terraform infrastructure changes automatically on merges to `main`.
