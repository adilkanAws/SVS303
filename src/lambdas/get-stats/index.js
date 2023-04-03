const { DynamoDBClient, GetItemCommand, ScanCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const dynamodbClient = new DynamoDBClient({});

exports.handler = async event => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));
  const input = {
    TableName: process.env.TABLE_NAME,
  }
  let lastEvaluatedKey;
  do {
    const command = new ScanCommand(input);
    const { Items, LastEvaluatedKey } = await client.send(command);
    lastEvaluatedKey = LastEvaluatedKey;
    const p = Items.map(item => {
      const { status } = unmarshall(item);
      const input = {
        TableName: process.env.TABLE_NAME,
      }
    })
  } while (lastEvaluatedKey);
  
  return {
    
  };
};
