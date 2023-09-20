import { MetricUnits, logMetrics } from '@aws-lambda-powertools/metrics';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer';
import { SES } from '@aws-sdk/client-ses';
import middy from '@middy/core';
import { SQSEvent, SQSRecord } from 'aws-lambda';
import { logger, metrics, tracer } from '../powertools/utilities';

const ses = new SES();

const handler = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body) as NotificationEvent;
      await sendEmail(message);
      logger.info(`Email sent (subject: ${message.subject} , destination: ${message.destination})`);
      metrics.addMetric('emailSent', MetricUnits.Count, 1);
    }
  } catch (error) {
    logger.error(`Failed sending email error: ${error}`);
  }
};

interface NotificationEvent {
    destination: string;
    subject: string;
    content: string;
    eventType: string;
}

async function sendEmail(message: NotificationEvent) {
  const params = {
    Source: 'no-reply@answering.com.co',
    Destination: {
      ToAddresses: [message.destination],
    },
    Message: {
      Subject: {
        Data: message.subject,
      },
      Body: {
        Html: {
          Data: message.content,
        },
      },
    },
  };

  // Send email using SES
  await ses.sendEmail(params);
}

const lambdaHandler = middy(handler)
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics, { captureColdStartMetric: true }));

export { lambdaHandler };
