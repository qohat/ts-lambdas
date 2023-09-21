#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import "source-map-support/register";
import { AnsweringLambdasStack } from '../lib/AnsweringLambdasStack';
import { App, Stage, StageProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { TargetRegions } from "../config/environments";

const app = new App();

interface DeploymentStageProps extends StageProps {
  stage: string
  dnsSuffix?: string
}

interface EnvironmentStageProps extends StageProps {
  stage: string
}

class EnvironmentStage extends Stage {
  constructor(scope: Construct, id: string, props: EnvironmentStageProps) {
      super(scope, id, props)
    new DeploymentStage(this, 'app', {
      env: {account: Stage.of(this)?.account, region: props.env?.region},
      stage: props.stage
    })
  }
}

class DeploymentStage extends Stage {
  constructor(scope: Construct, id: string, props: DeploymentStageProps) {
    super(scope, id, props)
    new AnsweringLambdasStack(this, 'answering-lambdas-stacks', {})
  }
}

TargetRegions.forEach(
    region =>
      new EnvironmentStage(app, `dev-${region}`, {
        env: { region },
        stage: 'dev'
      })
  )
