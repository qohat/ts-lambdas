import { SES } from '@aws-sdk/client-ses';
import { SQSEvent, SQSRecord } from 'aws-lambda';

const ses = new SES();

exports.handler = async (event: SQSEvent) => {
  try {
    for (const record of event.Records) {
      const message = JSON.parse(record.body) as NotificationEvent;
      await sendEmail(message);
    }
  } catch (error) {
    console.error('Error processing SQS messages:', error);
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
