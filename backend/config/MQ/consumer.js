// auditConsumer.js
const amqp = require('amqplib');
const { redis, connectRedis } = require('../../config/Redis/myRedisClient.js');
const logEmitter = require('../../utils/logEmitter.js');
let connection;
let channel;



const queueName = 'audit';


const flattenToXAddArgs = (obj) =>
  Object.entries(obj).flatMap(([k, v]) => [k, typeof v === 'object' ? JSON.stringify(v) : String(v)]);


async function initConsumer(handleMessage) {
  
  try {
    // setInterval(() => {  
    // }, 1000);
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    await connectRedis();
    // Only connect once
    if (!connection) {
      connection = await amqp.connect(process.env.RABBITMQ_URL);
      channel = await connection.createChannel();
    }

    channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });

    console.log(`Waiting for messages in "${queueName}".`);

    console.log('Connecting to Redis');
    await connectRedis();
    console.log('Connected to Redis');
    console.log('Redis isOpen:', redis.isOpen);

    channel.consume(
      queueName,
      async (msg) => {
        if (msg !== null) {
          try {
            
            const content = JSON.parse(msg.content.toString());
            const args = flattenToXAddArgs(content);

            await redis.xAdd('audit', '*', args);
            console.log(`Message added to Redis: ${content}`);
            logEmitter.emit('log', content);
            console.log('Emitted log to logEmitter:', content);

            channel.ack(msg); 
          } catch (err) {
            console.error('Error handling message:', err);
          }
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error('Consumer init failed:', err);
  }
}



module.exports = { initConsumer };
