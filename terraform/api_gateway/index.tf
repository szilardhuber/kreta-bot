variable "region" {}
variable "lambda_arn" {}

resource "aws_api_gateway_rest_api" "api" {
  name = "ekreta"
}

resource "aws_api_gateway_resource" "resource" {
  path_part = "resource"
  parent_id = "${aws_api_gateway_rest_api.api.root_resource_id}"
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
}

resource "aws_api_gateway_method" "method" {
  rest_api_id   = "${aws_api_gateway_rest_api.api.id}"
  resource_id   = "${aws_api_gateway_resource.resource.id}"
  http_method   = "GET"
  authorization = "NONE"
}

resource "aws_api_gateway_integration" "integration" {
  rest_api_id             = "${aws_api_gateway_rest_api.api.id}"
  # resource_id             = "${aws_api_gateway_rest_api.api.root_resource_id}"
  resource_id             = "${aws_api_gateway_resource.resource.id}"
  http_method             = "${aws_api_gateway_method.method.http_method}"
  integration_http_method = "POST"
  type                    = "AWS_PROXY"
  uri                     = "arn:aws:apigateway:${var.region}:lambda:path/2015-03-31/functions/${var.lambda_arn}/invocations"
}

# Deployment
resource "aws_api_gateway_deployment" "deployment_dev" {
  depends_on = [
    "aws_api_gateway_method.method",
    "aws_api_gateway_integration.integration"
  ]
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  stage_name = "dev"
}

resource "aws_api_gateway_deployment" "deployment_prod" {
  depends_on = [
    "aws_api_gateway_method.method",
    "aws_api_gateway_integration.integration"
  ]
  rest_api_id = "${aws_api_gateway_rest_api.api.id}"
  stage_name = "api"
}

output "dev_url" {
  value = "https://${aws_api_gateway_deployment.deployment_dev.rest_api_id}.execute-api.${var.region}.amazonaws.com/${aws_api_gateway_deployment.deployment_dev.stage_name}"
}

output "prod_url" {
  value = "https://${aws_api_gateway_deployment.deployment_prod.rest_api_id}.execute-api.${var.region}.amazonaws.com/${aws_api_gateway_deployment.deployment_prod.stage_name}"
}

output "id" {
  value = "${aws_api_gateway_rest_api.api.id}"
}

output "http_method" {
  value = "${aws_api_gateway_method.method.http_method}"
}

output "path" {
  value = "${aws_api_gateway_resource.resource.path}"
}
