import { WebSocketServer } from 'ws';
import { redis, connectRedis } from '../config/Redis/myRedisClient.js';
import logEmitter from './logEmitter.js';
export const startWebSocketLogStream = async (server) => {
  const wss = new WebSocketServer({ server });

  wss.on('connection', async (ws) => {
    console.log('WebSocket client connected');

    logEmitter.on('log', (log) => {
      console.log('Received log from logEmitter:', log);
      ws.send(JSON.stringify(log));
      console.log('Sent log to client:', log);
    });

    try {
        await connectRedis();
        console.log('Reading existing logs from Redis');
        const entries = await redis.xRange('audit', '-', '+');

        for (const entry of entries) {
          const { id, message } = entry;
          const fields = Object.values(message);
          const log = {};
        
          for (let i = 0; i < fields.length; i += 2) {
            log[fields[i]] = fields[i + 1];
          }
        
          log.redisId = id;
          ws.send(JSON.stringify(log));
          console.log('Sent log to client:', log);
        }
        
    } catch (err) {
      console.error('Error reading existing logs from Redis:', err);
    }

    
    const listenForNewLogs = async () => {
      let lastId = '$';

      while (ws.readyState === ws.OPEN) {
        try {
          const result = await redis.xRead(
            [{ key: 'audit', id: lastId }],
            { BLOCK: 0 }
          );

          if (result) {
            for (const stream of result) {
              for (const [id, fields] of stream.messages) {
                const log = {};
                for (let i = 0; i < fields.length; i += 2) {
                  log[fields[i]] = fields[i + 1];
                }
                log.redisId = id;
                ws.send(JSON.stringify(log));
                lastId = id;
              }
            }
          }
        } catch (err) {
          console.error('Error reading new logs from Redis:', err);
          break;
        }
      }
    };

    listenForNewLogs();
  });

  console.log('✅ WebSocket + Redis log streaming is active');
};
