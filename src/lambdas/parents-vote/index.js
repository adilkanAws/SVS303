const { DynamoDBClient, PutItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const dynamodbClient = new DynamoDBClient({});

exports.handler = async event => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));
  const p = event.Records.map(({ body }) => {
    const { data: { id, status } } = JSON.parse(body);
    const putItemCommand = new PutItemCommand({
      TableName: process.env.TABLE_NAME,
      Item: marshall({
        id,
        status,
      })
    });
    return dynamodbClient.send(putItemCommand);
  })
  await Promise.all(p);
  return {};
};
