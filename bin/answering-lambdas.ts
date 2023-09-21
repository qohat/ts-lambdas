#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as dotenv from 'dotenv';                             
import { RoleLambdaStack } from '../lib/RoleLambdaStack';
import { DynamoStack } from "../lib/DynamoStack";
import { SqsStack } from "../lib/SqsStack";
import { LambdaStack } from "../lib/LambdaStack";
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { getSystemErrorMap } from "util";

dotenv.config()
const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT || '', region: process.env.CDK_DEFAULT_REGION || ''};
const environmentName = process.env.ENVIRONMENT_NAME || "dev";
const projectName = process.env.PROJECT_NAME || "answering";

const dynamoDbRemindersStack = new DynamoStack(app, [environmentName, projectName,'reminders-dinamoDB'].join('-'), { 
  env, 
  tableName: [environmentName, projectName,"Reminders"].join('-'),
  partitionKey: "UserId",
  sortKey:"CompositeKey"
})

const dynamoDbCommentsStack = new DynamoStack(app, [environmentName, projectName,'comments-dinamoDB'].join('-'), { 
  env, 
  tableName: [environmentName, projectName,"Comments"].join('-'),
  partitionKey: "EntityId",
  sortKey:"CompositeKey"
})

const dynamoDbFormsSubmissionsStack = new DynamoStack(app, [environmentName, projectName,'formsSubmissions-dinamoDB'].join('-'), { 
  env, 
  tableName: [environmentName, projectName,"FormsSubmissions"].join('-'),
  partitionKey: "EntityId",
  sortKey:"CompositeKey"
})

const queueStack = new SqsStack(app, [environmentName, projectName,'notification-event-queueSQS'].join('-'), { env, environmentName, projectName })

const remindersLambdaStack = new LambdaStack(app, [environmentName, projectName,'reminder-lambda'].join('-'), {
    env,
    dynamoDbTableName: dynamoDbRemindersStack.tableName,
    sqsQueueUrl: queueStack.queueUrl,
    lambdaName: [environmentName, projectName,"ReminderStreamingLambda"].join('-'),
    lambdaPath: "reminder-streaming"
  })

const emailLambdaStack = new LambdaStack(app, [environmentName, projectName,'email-notification-lambda'].join('-'), {
    env,
    dynamoDbTableName: dynamoDbRemindersStack.tableName,
    sqsQueueUrl: queueStack.queueUrl,
    lambdaName: [environmentName, projectName,"EmailNotificationLambda"].join('-'),
    lambdaPath: "email-notification"
  })

const StackEntity = new RoleLambdaStack(app, [environmentName, projectName, 'role-lambda'].join('-'), { env, environmentName, projectName });

// Attach the role to the Lambda function
dynamoDbRemindersStack.table.grantStreamRead(remindersLambdaStack.lambda);
queueStack.queue.grantSendMessages(remindersLambdaStack.lambda);
queueStack.queue.grantConsumeMessages(emailLambdaStack.lambda);

remindersLambdaStack.lambda.addEventSourceMapping('RemindersDynamoEventSource', {
  enabled: true,
  eventSourceArn: dynamoDbRemindersStack.table.tableStreamArn,
  startingPosition: lambda.StartingPosition.TRIM_HORIZON
})


emailLambdaStack.addDependency(dynamoDbRemindersStack);
remindersLambdaStack.addDependency(dynamoDbRemindersStack);
app.synth();
