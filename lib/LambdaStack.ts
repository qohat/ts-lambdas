import { Duration, Stack, StackProps, aws_logs } from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_lambda, aws_lambda_nodejs } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

interface LambdaStackProps extends StackProps {
    dynamoDbTableName: string,
    sqsQueueUrl: string,
    lambdaName: string,
    lambdaPath: string
}

export class LambdaStack extends Stack {
    public readonly lambda: NodejsFunction

    constructor(scope: Construct, id: string, props: LambdaStackProps) {
        super(scope, id, props);

        const envVariables = {
            AWS_ACCOUNT_ID: Stack.of(this).account,
            POWERTOOLS_SERVICE_NAME: 'answering-lambdas',
            POWERTOOLS_LOGGER_LOG_LEVEL: 'WARN',
            POWERTOOLS_LOGGER_SAMPLE_RATE: '0.01',
            POWERTOOLS_LOGGER_LOG_EVENT: 'true',
            POWERTOOLS_METRICS_NAMESPACE: 'AwsSamples',
        };

        const esBuildSettings = {
            minify: true
        }

        const functionSettings = {
            handler: "handler",
            timeout: Duration.seconds(60),
            runtime: aws_lambda.Runtime.NODEJS_16_X,
            memorySize: 256,
            environment: {
                DYNAMO_TABLE_NAME: props.dynamoDbTableName,
                SQS_QUEUE_URL: props.sqsQueueUrl,
                ...envVariables
            },
            logRetention: aws_logs.RetentionDays.ONE_WEEK,
            tracing: aws_lambda.Tracing.ACTIVE,
            bundling: esBuildSettings
        }

        this.lambda = new aws_lambda_nodejs.NodejsFunction(
            this,
            props.lambdaName,
            {
                awsSdkConnectionReuse: true,
                entry:`./src/lambdas/${props.lambdaPath}.ts`,
                ...functionSettings
            }
        );
    }
}