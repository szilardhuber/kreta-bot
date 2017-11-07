variable "lambda_arn" {}

resource "aws_cloudwatch_event_rule" "every_thirty_minutes" {
    name = "every-thirty-minutes"
    description = "Fires every thirty minutes"
    schedule_expression = "rate(30 minutes)"
}

resource "aws_cloudwatch_event_target" "ekreta_every_thirty_minutes" {
    rule = "${aws_cloudwatch_event_rule.every_thirty_minutes.name}"
    target_id = "ekreta"
    arn = "${var.lambda_arn}"
}

output "arn" {
    value = "${aws_cloudwatch_event_rule.every_thirty_minutes.arn}"
}
