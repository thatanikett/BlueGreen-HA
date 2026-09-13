resource "random_id" "codedeploy_bucket" {
  byte_length = 4
}

resource "aws_s3_bucket" "codedeploy_deployments" {
  bucket        = "${var.project_name}-deployments-${random_id.codedeploy_bucket.hex}"
  force_destroy = true
}

resource "aws_codedeploy_app" "backend" {
  compute_platform = "Server"
  name             = "${var.project_name}-backend-app"
}

resource "aws_codedeploy_deployment_group" "backend" {
  app_name               = aws_codedeploy_app.backend.name
  deployment_group_name  = "${var.project_name}-backend-dg"
  service_role_arn       = aws_iam_role.codedeploy.arn
  deployment_config_name = "CodeDeployDefault.AllAtOnce"

  blue_green_deployment_config {
    deployment_ready_option {
      action_on_timeout = "CONTINUE_DEPLOYMENT"
    }

    green_fleet_provisioning_option {
      action = "COPY_AUTO_SCALING_GROUP"
    }

    terminate_blue_instances_on_deployment_success {
      action                           = "TERMINATE"
      termination_wait_time_in_minutes = 5
    }
  }

  deployment_style {
    deployment_option = "WITH_TRAFFIC_CONTROL"
    deployment_type   = "BLUE_GREEN"
  }

  load_balancer_info {
    target_group_info {
      name = aws_lb_target_group.blue.name
    }
  }

  autoscaling_groups = [aws_autoscaling_group.backend.name]
}
