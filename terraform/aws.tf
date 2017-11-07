variable "region" {
    default = "us-east-1"
}

variable "accountId" {
    default = "132805188284"
}

module "lambda" {
    source = "./lambda"

    region = "${var.region}"
    accountId = "${var.accountId}"
    webhook_url = "cica"
    username = "cica"
    password = "cica"
}

module "api_gateway" {
    source = "./api_gateway"

    region = "${var.region}"
    lambda_arn = "${module.lambda.arn}"
}

module "cloudwatch" {
    source = "./cloudwatch"

    lambda_arn = "${module.lambda.arn}"
}

resource "aws_lambda_permission" "allow_cloudwatch_to_call_ekreta" {
    statement_id = "AllowExecutionFromCloudWatch"
    action = "lambda:InvokeFunction"
    function_name = "${module.lambda.function_name}"
    principal = "events.amazonaws.com"
    source_arn = "${module.cloudwatch.arn}"
}

resource "aws_lambda_permission" "apigw_lambda" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = "${module.lambda.arn}"
  principal     = "apigateway.amazonaws.com"


  # More: http://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-control-access-using-iam-policies-to-invoke-api.html
  source_arn = "arn:aws:execute-api:${var.region}:${var.accountId}:${module.api_gateway.id}/*/${module.api_gateway.http_method}${module.api_gateway.path}"
}



