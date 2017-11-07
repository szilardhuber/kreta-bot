variable "region" {}
variable "accountId" {}
variable "username" {}
variable "password" {}
variable "webhook_url" {}

variable "package_file" {
    default = "../ekreta.zip"
}

resource "aws_lambda_function" "ekreta" {
  filename         = "${var.package_file}"
  function_name    = "ekreta"
  role             = "${aws_iam_role.iam_for_lambda.arn}"
  handler          = "index.handler"
  source_code_hash = "${base64sha256(file("${var.package_file}"))}"
  runtime          = "nodejs6.10"
  timeout          = 30

  environment {
    variables = {
      username = "${var.username}"
      password = "${var.password}"
      webhook_url = "${var.webhook_url}"
    }
  }
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

output "arn" {
    value = "${aws_lambda_function.ekreta.arn}"
}

output "function_name" {
    value = "${aws_lambda_function.ekreta.function_name}"
}
