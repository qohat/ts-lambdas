import { Stack, StackProps } from "aws-cdk-lib";
import { aws_sqs } from "aws-cdk-lib";
import { IQueue } from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";

export class SqsStack extends Stack {
    readonly queue: IQueue
    readonly queueUrl: string

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);
        this.queue = new aws_sqs.Queue(this, "Notificatio Events", {
            queueName: "notification-event-queue",
        });
        this.queueUrl = this.queue.queueUrl
    }
}