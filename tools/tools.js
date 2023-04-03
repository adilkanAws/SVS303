import { Config }from "./config.js";
import { uniqueNamesGenerator, countries, names } from 'unique-names-generator';
import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb"; // ES Modules import

const toysDict = [
  'Football',
  'Violin',
  'Rollers',
  'Skateboard',
  'AWS Credits',
  'Aeroplane',
  'Ball',
  'Bicycle',
  'Car',
  'Teddybear',
  'Doll',
  'Duck',
  'Kite',
  'Rocking horse',
  'Army men',
  'Car',
  'Swing',
  'Trampoline',
  'Laptop',
  'Phone',
  'Video games',
  'Horse Stable',
  'Wooden Crane',
  'Dominos',
  'Go board',
  'Chess',
  'Ribbon Streamer',
  'Puzzle',
  'Book',
  'Truck',
  'Piano',
  'Manga',
  'Tea set',
  'Walkie Talkies',
  'Drawing kit',
  'Surf board',
  'Microscope',
  'Lava lamp',
  'Tablet',
  'Binoculars',
  'Magic Kit',
  'Bow and Arrow',
  'Tennis racket',
  'Headphones',
  'Watch',
  'Camera',
  'Telescope'
];

export class Tools {
  constructor() {
    this.config = new Config();
    this.s3Client = new S3Client({});
    this.DynamoDBClient = new DynamoDBClient({});
  }

  async generateLetters() {
    await this.config.getNumberOfLetters();
    await this.config.getLettersBucketName();
    let p = [];
    for (let i = 0; i < this.config.numberOfLetters; i++) {
      p.push(this.generateLetter(i));
      if (p.length === 5000) {
        await Promise.all(p);
        p = []; 
      }
    }
    await Promise.all(p);
  }

  async generateLetter(id) {
    const name = uniqueNamesGenerator({ dictionaries: [names] }); 
    const country = uniqueNamesGenerator( { dictionaries: [countries] }); 
    const toys = []
    for (let i = 0; i < Math.floor(Math.random() * 4) + 1; i++) {
      toys.push(uniqueNamesGenerator({ dictionaries: [toysDict] }))
    }
    const letter = {
      id,
      from: name,
      country,
      toys,
    }
    await this.sendLetter(letter);
  }

  async sendLetter(letter) {
    const input = {
      Body: JSON.stringify(letter),
      Bucket: this.config.lettersBucketName,
      Key: `letter_${letter.id}`,
    };
    const command = new PutObjectCommand(input);
    const res = await this.s3Client.send(command);
  }

  async emptyBuckets() {
    await this.config.getLettersBucketName();
    const buckets = [
      this.config.lettersBucketName,
    ].filter(t => t);
    for (let i = 0; i < buckets.length; i++) {
      const bucket = buckets[i];
      await this.emptyBucket(bucket);
    }
  }

  async emptyBucket(bucket, ContinuationToken) {
    const input = {
      Bucket: bucket, 
      ContinuationToken,
    };
    const command = new ListObjectsV2Command(input);
    const { Contents, NextContinuationToken} = await this.s3Client.send(command);
    if (Array.isArray(Contents) && Contents.length > 0) {
      await Promise.all(Contents.map(async (object) => {
        const input = {
          Bucket: bucket,
          Key: object.Key,
        };
        const command = new DeleteObjectCommand(input);
        return this.s3Client.send(command);
      }));
      return this.emptyBucket(bucket, NextContinuationToken)
    }
  }
  
  async emptyTables() {
    const lettersTable = await this.config.getLettersTable();
    const tables = [
      lettersTable,
    ]
    for (let i = 0; i < tables.length; i++) {
      const table = tables[i];
      await this.emptyTable(table);
    }
  }

  async emptyTable(table, lastEvaluatedKey) {
    const input = {
      TableName: table,
      ExclusiveStartKey: lastEvaluatedKey,
      AttributesToGet: ['id'],
    }
    const command = new ScanCommand(input);
    const { Items, LastEvaluatedKey } = await this.DynamoDBClient.send(command); 
    if (Array.isArray(Items) && Items.length > 0) {
      while (Items.length) {
        const batchOf100 = Items.splice(0, 100)
        await Promise.all(batchOf100.map(item => {
          const input =  {
            TableName: table,
            Key: item,
          };
          const command = new DeleteItemCommand(input);
          try {
            return this.DynamoDBClient.send(command);
          } catch (error) {

          }
        }));
      }
      if (LastEvaluatedKey) {
        return this.emptyTable(table, LastEvaluatedKey)
      }
    }
  }

  uploadDashabord() {
    
  }
}