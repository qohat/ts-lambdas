// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0


import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';

interface StackProp extends cdk.StackProps {
  environmentName: string;
  projectName: string;
}

export class RoleLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: StackProp) {
    super(scope, id, props);

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

	// Import Stacks get Secret ARN with Stacks info 
    const emailLambda = lambda.Function.fromFunctionArn(
      this,
      [props.environmentName, props.projectName,'emailLambda'].join('-'),
      cdk.Fn.importValue([props.environmentName, props.projectName,"EmailNotificationLambda-ARN"].join('-'))
  )

  // Attach the role to the Lambda function
    emailLambda.addToRolePolicy(sesPolicy);        

  }
}
