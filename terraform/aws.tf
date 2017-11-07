# Variables
variable "myregion" {
    default = "us-east-1"
}

variable "accountId" {
    default = "132805188284"
}

# API Gateway
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
  uri                     = "arn:aws:apigateway:${var.myregion}:lambda:path/2015-03-31/functions/${aws_lambda_function.ekreta.arn}/invocations"
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
  value = "https://${aws_api_gateway_deployment.deployment_dev.rest_api_id}.execute-api.${var.myregion}.amazonaws.com/${aws_api_gateway_deployment.deployment_dev.stage_name}"
}

output "prod_url" {
  value = "https://${aws_api_gateway_deployment.deployment_prod.rest_api_id}.execute-api.${var.myregion}.amazonaws.com/${aws_api_gateway_deployment.deployment_prod.stage_name}"
}

# Lambda
resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${aws_lambda_function.ekreta.arn}"
  principal     = "apigateway.amazonaws.com"

  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${var.myregion}:${var.accountId}:${aws_api_gateway_rest_api.api.id}/*/${aws_api_gateway_method.method.http_method}${aws_api_gateway_resource.resource.path}"
}



resource "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "lambda.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF
}

resource "aws_iam_policy" "policy" {
    name        = "dynamodb-policy"
    description = "Dynamodb Policy"
    policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "DynamodbFullAcccess",
      "Effect": "Allow",
      "Action": "dynamodb:*",
      "Resource": "arn:aws:dynamodb:*"
    }
  ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambda_dynamo_attach" {
    role       = "${aws_iam_role.iam_for_lambda.name}"
    policy_arn = "${aws_iam_policy.policy.arn}"
}

resource "aws_lambda_function" "ekreta" {
  filename         = "ekreta.zip"
  function_name    = "ekreta"
  role             = "${aws_iam_role.iam_for_lambda.arn}"
  handler          = "index.handler"
  source_code_hash = "${base64sha256(file("ekreta.zip"))}"
  runtime          = "nodejs6.10"
  timeout          = 30

  environment {
    variables = {
      foo = "bar"
    }
  }
}

resource "aws_cloudwatch_event_rule" "every_thirty_minutes" {
    name = "every-thirty-minutes"
    description = "Fires every thirty minutes"
    schedule_expression = "rate(30 minutes)"
}

resource "aws_cloudwatch_event_target" "ekreta_every_thirty_minutes" {
    rule = "${aws_cloudwatch_event_rule.every_thirty_minutes.name}"
    target_id = "ekreta"
    arn = "${aws_lambda_function.ekreta.arn}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_ekreta" {
    statement_id = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    function_name = "${aws_lambda_function.ekreta.function_name}"
    principal = "events.amazonaws.com"
    source_arn = "${aws_cloudwatch_event_rule.every_thirty_minutes.arn}"
}
