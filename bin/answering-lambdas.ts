#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import "source-map-support/register";
import * as cdk from "aws-cdk-lib";
import * as dotenv from 'dotenv';                             
import { AnsweringLambdasStack } from '../lib/AnsweringLambdasStack';


dotenv.config()
const app = new cdk.App();
const env = { account: process.env.CDK_DEFAULT_ACCOUNT || '', region: process.env.CDK_DEFAULT_REGION || ''};
const environmentName = process.env.ENVIRONMENT_NAME || "dev";
const projectName = process.env.PROJECT_NAME || "answering";

new AnsweringLambdasStack(app, [environmentName, projectName, 'LambdasStack'].join('-'), { env, environmentName, projectName });
