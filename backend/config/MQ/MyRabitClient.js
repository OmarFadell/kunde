import amqp from 'amqplib';

let channel;

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    channel = await connection.createChannel();
    console.log('Connected to RabbitMQ');

    // Optional: assert queue here if needed
    await channel.assertQueue('logs');
  } catch (err) {
    console.error('RabbitMQ connection error:', err);
  }
}

function getChannel() {
  if (!channel) throw new Error('RabbitMQ channel not initialized');
  return channel;
}

export { connectRabbitMQ, getChannel };
