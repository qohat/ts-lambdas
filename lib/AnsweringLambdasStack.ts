// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { DynamoStack } from "./DynamoStack";
import { SqsStack } from "./SqsStack";
import { LambdaStack } from "./LambdaStack";
import * as lambda from 'aws-cdk-lib/aws-lambda';

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
