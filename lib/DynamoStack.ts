import { RemovalPolicy, Stack, StackProps } from "aws-cdk-lib";
import { aws_dynamodb } from "aws-cdk-lib";
import { ITable, StreamViewType } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";

export class DynamoStack extends Stack {
    readonly table: ITable
    readonly tableName: string

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        this.tableName = "Reminders"

        this.table = new aws_dynamodb.Table(this, "Reminders", {
            tableName: this.tableName,
            partitionKey: {
                name: "UserId",
                type: aws_dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: "CompositeKey",
                type: aws_dynamodb.AttributeType.STRING
            },
            timeToLiveAttribute: "TTL",
            pointInTimeRecovery: true,
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY
        });
    }
}