import { DynamoDBStreamHandler, DynamoDBStreamEvent } from 'aws-lambda';
import { logger, metrics, tracer } from '../powertools/utilities';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { logMetrics, MetricUnits } from '@aws-lambda-powertools/metrics';
import middy from '@middy/core';
import { SQS } from '@aws-sdk/client-sqs';

const sqs = new SQS();

export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  for (const record of event.Records) {
    if (record.eventName === 'REMOVE' && record.dynamodb?.OldImage?.ttl.N) {
      const userId = record.dynamodb?.OldImage?.UserId.S;
      const compositeKey = record.dynamodb?.OldImage?.CompositeKey.S;
      const ttl = parseInt(record.dynamodb?.OldImage?.ttl.N); // Convert TTL to a number

      const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds since epoch

      if (ttl < currentTime) {
          try {
          const event = record.dynamodb?.OldImage?.Event.S
          await sqs.sendMessage({
            QueueUrl: process.env.SQS_QUEUE_URL,
            MessageBody: event,
          });

          logger.info(`Expired user reminder (userId: ${userId}, compositeKey: ${compositeKey}) detected and sent to SQS.`);
          metrics.addMetric('expiredReminderSentToSQS', MetricUnits.Count, 1);
        } catch (error) {
          logger.error(`Error sending expired reminder to SQS. detail: ${error}`);
        }
      } else {
          logger.warn(`TTL is not in the past :P`);
      }
    }
  }
};

/*const lambdaHandler = middy(handler)
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics, { captureColdStartMetric: true }));

export { lambdaHandler };*/
