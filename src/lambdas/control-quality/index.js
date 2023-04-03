const { SQSClient, SendMessageCommand } = require("@aws-sdk/client-sqs");
const { unmarshall } = require("@aws-sdk/util-dynamodb");

const client = new SQSClient({ });

exports.handler = async event => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));
  const p = event.Records.map(async ({ dynamodb, eventName }) => {
    if (!["MODIFY", "INSERT"].includes(eventName)) {
      return;
    }
    const { NewImage } = dynamodb;
    //30% of the time, Gifts are rejected
    if ((Math.random() < 0.3)) {
      console.log('Rejected');
      const input = {
        QueueUrl: process.env.QUEUE_URL,
        MessageBody: JSON.stringify(unmarshall(NewImage)),
      }
      const command = new SendMessageCommand(input);
      await client.send(command);
    } else {
      console.log('TOY IS OK');
    }

  })
  return {};
};
