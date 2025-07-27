// messageQueue.js
const amqp = require('amqplib');
const createAuditMessage = require('../../config/MQ/auditMessage.js');

let connection;
let channel;

async function init() {
  if (!connection) {
    connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
  }
}

async function publish(queue, action, actor, entity, status) {

  if (!channel) {
    await init();
  }

  const message = createAuditMessage({ action, actor, entity, status });

  await channel.assertQueue(queue, { durable: true });
  channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), {
    persistent: true,
  });
  console.log(`Message published to ${queue}: ${message}`);
}

module.exports = { publish };
