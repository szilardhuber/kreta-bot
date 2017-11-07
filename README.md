# Kréti

This is a chatbot interface above [Neptun Kréta](https://ekreta.hu) so that we can have notifications on new marks (and in the future other events).
When deployed the script runs every 30 minutes and gets all marks from ekreta API and stores them to Amazon DynamoDB. When a record is new, a message is sent about it to Slack about its details.

## Install dependencies

Run `yarn` or `npm install` to install the required packages.

## Running locally

#### Set the folowing environment variables:

```
TF_VAR_username=<your_ekreta_username>
TF_VAR_password=<your_ekreta_password>
TF_VAR_slack_url=<the_slack_api_url_for_your_channel>
```

#### Run package

```node test.js```

## Deploying to AWS

We use Terraform for deploying the required AWS resources. In AWS we set up a lambda function with the content of the current folder, a CloudWatch rule so that the lambda function get called regularly and an API Gateway endpoint that is not currently used.  

You can get Terraform command line tool for your OS: from https://www.terraform.io/downloads.html

Besides the variables needed for local usage set the AWS environment variables for deployment:
```
AWS_ACCESS_KEY_ID=<your_AWS_acces_key>
AWS_SECRET_ACCESS_KEY=<your_AWS_secret_key>
AWS_DEFAULT_REGION=<AWS_region_code>
```

DynamoDB table is not yet created by Terraform (although it should be) so it needs to be created manually. (This is needed to be run once)

```
node create_table.js
```

Deployment is basically creating the zip file and running terraform but there is a convenience script for that:

```
yarn deploy
```
