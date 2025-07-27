import { createClient } from 'redis';
import mongoose from 'mongoose';
import cron from 'node-cron';
import dotenv from 'dotenv';
import Audit from '../models/Audit.js';
import redis from '../config/Redis/myRedisClient.js';
dotenv.config();

const flush = async () => {
    try {
      const entries = await redis.xRange('audit', '-', '+');
  
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];
        const { id, message } = entry;
        const log = { };
  
        
        const fields = Object.values(message);
        console.log('fields', fields);

        log['user'] = fields[5];
        log['action'] = fields[3];
        log['status'] = fields[7];
        console.log('status', fields[7]);
        log['timestamp'] = fields[1];
        log['redisId'] = id;
  

        
        console.log('creating log: ',log);
        await Audit.create(log);
        console.log('created log', i, 'of', entries.length);
      }
    } catch (error) {
      console.error('Error flushing Redis to MongoDB:', error);
    }
  };
  

flush();
cron.schedule('0 */12 * * *', async () => {
    await flush();

    try{
        const cutoffTimestamp = Date.now() - 12 * 60 * 60 * 1000; // 12 hrs in ms
        const minId = `${cutoffTimestamp}-0`;
    
        await redisClient.xTrim('audit', 'MINID', minId);
        console.log('Trimmed Redis stream entries older than 12 hours');

    } catch (error) {
        console.error('Error flushing Redis to MongoDB:', error);
    }
});

