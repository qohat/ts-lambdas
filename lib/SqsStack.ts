import { Stack, StackProps } from "aws-cdk-lib";
import { aws_sqs } from "aws-cdk-lib";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

interface StackProp extends StackProps {
    environmentName: string;
    projectName: string;
  }

export class SqsStack extends Stack {
    readonly queue: IQueue
    readonly queueUrl: string

    constructor(scope: Construct, id: string, props: StackProp) {
        super(scope, id, props);
        this.queue = new aws_sqs.Queue(this, [props.environmentName, props.projectName,"Notificatio Events"].join('-'), {
            queueName: [props.environmentName, props.projectName,"notification-event-queue"].join('-'),
        });
        this.queueUrl = this.queue.queueUrl
    }
}