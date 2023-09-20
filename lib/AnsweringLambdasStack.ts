// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoStack } from "./DynamoStack";
import { SqsStack } from "./SqsStack";
import { LambdaStack } from "./LambdaStack";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';

export class AnsweringLambdasStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const dynamoDbStack = new DynamoStack(this, 'reminders-table', {
      stackName: 'reminders-dynamo-db-table'
    })

    const queueStack = new SqsStack(this, 'notification-event-queue', {
      stackName: 'notification-event-queue'
    })

    const remindersLambdaStack = new LambdaStack(this, 'reminder-answering-lambda', {
      dynamoDbTableName: dynamoDbStack.tableName,
      sqsQueueUrl: queueStack.queueUrl,
      lambdaName: "ReminderStreamingLambda",
      lambdaPath: "reminder-streaming"
    })

    const emailLambdaStack = new LambdaStack(this, 'email-notification-answering-lambda', {
      dynamoDbTableName: dynamoDbStack.tableName,
      sqsQueueUrl: queueStack.queueUrl,
      lambdaName: "EmailNotificationLambda",
      lambdaPath: "email-notification"
    })

    // Create an IAM role for the Lambda function
    const lambdaRole = new iam.Role(this, 'LambdaRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
    });

    // Attach the SES send-email permission policy to the Lambda role
    const sesPolicy = new iam.PolicyStatement({
      actions: ['ses:SendEmail'],
      effect: iam.Effect.ALLOW,
      resources: ['*'], // You can limit this to specific SES resources if needed
    });

    lambdaRole.addToPolicy(sesPolicy);

    // Attach the role to the Lambda function
    emailLambdaStack.lambda.addToRolePolicy(sesPolicy);

    dynamoDbStack.table.grantStreamRead(remindersLambdaStack.lambda);
    queueStack.queue.grantSendMessages(remindersLambdaStack.lambda);
    queueStack.queue.grantConsumeMessages(emailLambdaStack.lambda);


    remindersLambdaStack.lambda.addEventSourceMapping('RemindersDynamoEventSource', {
      enabled: true,
      eventSourceArn: dynamoDbStack.table.tableArn,
      startingPosition: lambda.StartingPosition.TRIM_HORIZON
    })
  }
}
