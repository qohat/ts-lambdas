import { RemovalPolicy, Stack, StackProps,CfnOutput } from "aws-cdk-lib";
import { aws_dynamodb } from "aws-cdk-lib";
import { ITable, StreamViewType } from "aws-cdk-lib/aws-dynamodb";
import { Construct } from "constructs";


interface StackProp extends StackProps {
    tableName: string,
    partitionKey: string,
    sortKey:string
  }

export class DynamoStack extends Stack {
    readonly table: ITable
    readonly tableName: string

    constructor(scope: Construct, id: string, props: StackProp) {
        super(scope, id, props);
        
        this.table = new aws_dynamodb.Table(this, props.tableName, {
            tableName: props.tableName,
            partitionKey: {
                name: props.partitionKey,
                type: aws_dynamodb.AttributeType.STRING,
            },
            sortKey: {
                name: props.sortKey,
                type: aws_dynamodb.AttributeType.STRING
            },
            timeToLiveAttribute: "TTL",
            pointInTimeRecovery: true,
            stream: StreamViewType.NEW_AND_OLD_IMAGES,
            billingMode: aws_dynamodb.BillingMode.PAY_PER_REQUEST,
            removalPolicy: RemovalPolicy.DESTROY
        });

        // Exports Stack
        new CfnOutput(this, [props.tableName,'DinamoDBArn'].join('-'), {
            value: this.table.tableArn,
            description: ['Export', props.tableName,'DinamoDB'].join('-'),
            exportName: [props.tableName,'DinamoDB'].join('-'),
        })
    }
}