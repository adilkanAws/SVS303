const { DynamoDBClient, GetItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");

const dynamodbClient = new DynamoDBClient({});

exports.handler = async event => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));
  const input = {
    TableName: process.env.TABLE_NAME,
  }
  const command = new ScanCommand(input);
  const { Items, LastEvaluatedKey } = await client.send(command);
  return {
    Items, LastEvaluatedKey
  };
};
