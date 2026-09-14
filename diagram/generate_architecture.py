#!/usr/bin/env python3
"""
AWS Architecture Diagram Generator for BlueGreen-HA Project
Generated directly from Terraform Infrastructure definition.
"""

from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import EC2, AutoScaling, ECR
from diagrams.aws.network import ALB, CloudFront, InternetGateway, VPC, RouteTable
from diagrams.aws.storage import S3
from diagrams.aws.database import RDSPostgresqlInstance, ElasticacheForRedis
from diagrams.aws.devtools import Codedeploy
from diagrams.aws.management import Cloudwatch, SystemsManagerParameterStore
from diagrams.onprem.vcs import Github
from diagrams.onprem.client import Users

graph_attr = {
    "fontsize": "24",
    "fontname": "Helvetica-Bold",
    "bgcolor": "#FAFAFA",
    "pad": "0.6",
    "splines": "ortho",
    "nodesep": "0.8",
    "ranksep": "0.9"
}

node_attr = {
    "fontsize": "12",
    "fontname": "Helvetica"
}

edge_attr = {
    "fontsize": "11",
    "fontname": "Helvetica"
}

with Diagram(
    "BlueGreen-HA Production Architecture (ap-south-1)",
    filename="architecture_diagram",
    show=False,
    direction="TB",
    graph_attr=graph_attr,
    node_attr=node_attr,
    edge_attr=edge_attr
):
    # External Actors
    users = Users("Clients / Web Browsers")
    github_ci = Github("GitHub Actions\nCI/CD Workflows")

    # Frontend Stack (Global / Edge)
    with Cluster("Frontend & CDN Layer (AWS Global / S3)"):
        cf = CloudFront("CloudFront CDN\n(TLS 1.2, OAC)")
        s3_frontend = S3("S3 Static Bucket\n(SPA React / HTML)")
        users >> Edge(label="HTTPS (443)", color="#2E7D32", style="bold") >> cf
        cf >> Edge(label="Origin Fetch (OAC)", color="#2E7D32") >> s3_frontend
        github_ci >> Edge(label="Sync SPA Build", color="#1565C0", style="dashed") >> s3_frontend

    # CI/CD & DevTools Stack
    with Cluster("CI/CD Deployment & Artifacts"):
        s3_deploy = S3("CodeDeploy S3 Bucket\n(Deployment Bundles)")
        ecr = ECR("ECR Repository\n(bluegreen-ha-backend)")
        codedeploy = Codedeploy("AWS CodeDeploy\n(Blue/Green Controller)")
        
        github_ci >> Edge(label="Upload Bundle", color="#1565C0", style="dashed") >> s3_deploy
        github_ci >> Edge(label="Push Docker Image", color="#1565C0", style="dashed") >> ecr
        github_ci >> Edge(label="Trigger Deployment", color="#1565C0", style="bold") >> codedeploy
        codedeploy >> Edge(label="Read Bundle", color="#455A64", style="dashed") >> s3_deploy

    # Monitoring & Config Management
    with Cluster("Shared Services & Observability"):
        cw_logs = Cloudwatch("CloudWatch Logs\n(/ecs/bluegreen-ha-backend)")
        ssm = SystemsManagerParameterStore("SSM Parameter Store\n(Env Secrets & DB Config)")

    # VPC Layer
    with Cluster("AWS VPC: 10.0.0.0/16 (ap-south-1)"):
        igw = InternetGateway("Internet Gateway\n(IGW)")
        public_rt = RouteTable("Public Route Table\n(0.0.0.0/0 -> IGW)")
        private_rt = RouteTable("Private Route Table\n(Local 10.0.0.0/16 Only)")

        alb = ALB("Application Load Balancer\n(Public Port 80 / HTTP)")
        asg = AutoScaling("Auto Scaling Group\n(bluegreen-ha-asg | Min:1 Des:2 Max:4)")

        # Ingress to ALB
        users >> Edge(label="HTTP / API Request", color="#E65100", style="bold") >> alb
        alb >> Edge(label="Route to ASG Target Group", color="#E65100") >> asg

        # Availability Zone 1
        with Cluster("Availability Zone: ap-south-1a"):
            with Cluster("Public Subnet 1 (10.0.1.0/24)"):
                ec2_blue_1 = EC2("EC2: Blue (Active)\nPort 8080 (Docker App)")
                ec2_green_1 = EC2("EC2: Green (Replacement)\nCodeDeploy Provisioned")

            with Cluster("Private DB Subnet 1 (10.0.5.0/24)"):
                rds_primary = RDSPostgresqlInstance("RDS PostgreSQL (Primary)\nMulti-AZ Master (Port 5432)")
                redis_primary = ElasticacheForRedis("ElastiCache Redis (Primary)\nCluster Node (Port 6379)")

        # Availability Zone 2
        with Cluster("Availability Zone: ap-south-1b"):
            with Cluster("Public Subnet 2 (10.0.3.0/24)"):
                ec2_blue_2 = EC2("EC2: Blue (Active)\nPort 8080 (Docker App)")
                ec2_green_2 = EC2("EC2: Green (Replacement)\nCodeDeploy Provisioned")

            with Cluster("Private DB Subnet 2 (10.0.6.0/24)"):
                rds_standby = RDSPostgresqlInstance("RDS PostgreSQL (Standby)\nMulti-AZ Replica")
                redis_replica = ElasticacheForRedis("ElastiCache Redis (Replica)\nAuto-Failover Node")

        # Route associations
        igw - Edge(color="#78909C", style="dotted") - public_rt
        public_rt - Edge(color="#78909C", style="dotted") - ec2_blue_1
        public_rt - Edge(color="#78909C", style="dotted") - ec2_blue_2
        private_rt - Edge(color="#78909C", style="dotted") - rds_primary
        private_rt - Edge(color="#78909C", style="dotted") - rds_standby

        # ALB to EC2 connections
        alb >> Edge(label="Forward (TG Blue)", color="#00897B") >> ec2_blue_1
        alb >> Edge(label="Forward (TG Blue)", color="#00897B") >> ec2_blue_2
        alb >> Edge(label="Switch Traffic (TG Green)", color="#43A047", style="dashed") >> ec2_green_1
        alb >> Edge(label="Switch Traffic (TG Green)", color="#43A047", style="dashed") >> ec2_green_2

        # CodeDeploy controls
        codedeploy >> Edge(label="Traffic Reroute", color="#6A1B9A", style="dashed") >> alb
        codedeploy >> Edge(label="Copy ASG Fleet & Test", color="#6A1B9A", style="dashed") >> ec2_green_1
        codedeploy >> Edge(label="Copy ASG Fleet & Test", color="#6A1B9A", style="dashed") >> ec2_green_2

        # App instance integrations
        ec2_blue_1 >> Edge(label="SQL (Port 5432 SSL)", color="#0277BD") >> rds_primary
        ec2_blue_2 >> Edge(label="SQL (Port 5432 SSL)", color="#0277BD") >> rds_primary
        ec2_green_1 >> Edge(label="SQL (Port 5432 SSL)", color="#0277BD") >> rds_primary
        ec2_green_2 >> Edge(label="SQL (Port 5432 SSL)", color="#0277BD") >> rds_primary

        ec2_blue_1 >> Edge(label="Cache (Port 6379)", color="#D32F2F") >> redis_primary
        ec2_blue_2 >> Edge(label="Cache (Port 6379)", color="#D32F2F") >> redis_primary
        ec2_green_1 >> Edge(label="Cache (Port 6379)", color="#D32F2F") >> redis_primary
        ec2_green_2 >> Edge(label="Cache (Port 6379)", color="#D32F2F") >> redis_primary

        # Multi-AZ Database & Cache Sync
        rds_primary >> Edge(label="Sync Replication", color="#0277BD", style="bold") >> rds_standby
        redis_primary >> Edge(label="Async Replication", color="#D32F2F", style="bold") >> redis_replica

        # Observability & Config links
        ec2_blue_1 >> Edge(color="#757575", style="dotted") >> cw_logs
        ec2_blue_1 >> Edge(color="#757575", style="dotted") >> ssm
