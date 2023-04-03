const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const { marshall } = require("@aws-sdk/util-dynamodb");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");

const dynamodbClient = new DynamoDBClient({});
const s3Client = new S3Client({});

exports.handler = async event => {
  // Log the event argument for debugging and for use in local development.
  console.log(JSON.stringify(event, undefined, 2));
  // Log the event argument for debugging and for use in local development.
  const p = event.Records.map(async ({ body }) => {
    const s3Event = JSON.parse(body)
    const promises = s3Event.Records.map(async ({ s3: { bucket, object } }) => {
      //Read the object
      const getObjectCommand = new GetObjectCommand({
        Bucket: bucket.name,
        Key: object.key,
      });
      const response = await s3Client.send(getObjectCommand);
      const letter = await response.Body.transformToString();   
      const item = JSON.parse(letter)
      //Store the object
      const putItemCommand = new PutItemCommand({
        TableName: process.env.TABLE_NAME,
        Item: marshall(item)
      });
      await dynamodbClient.send(putItemCommand);
    })
    await Promise.all(promises);
  });
  await Promise.all(p);
};
