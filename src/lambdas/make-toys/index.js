const { DynamoDBClient, PutItemCommand, DeleteItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const dynamodbClient = new DynamoDBClient({});

exports.handler = async event => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));
  const p = event.Records.map(async (record) => {

    const { dynamodb: { NewImage : letter } } = record;
    const { id, toys } = unmarshall(letter);    

    //Elves do their magic and create the toys 
    //10% of the time they fail to create the toys
    if ((Math.random() < 0.1)) {
      throw new Error(`Failed to create toys for child ${id}`)
    }

    //Store that the gift that was created
    const promises = toys.map(async (toy) => {
      const putItemCommand = new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall({
          id,
          toy
        })
      });
      return dynamodbClient.send(putItemCommand);
    })
    await Promise.all(promises);
  });

  await Promise.all(p);

  return {};
};
