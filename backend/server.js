const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const { connectRabbitMQ, getChannel } = require("./config/MQ/MyRabitClient");
const { initConsumer } = require("./config/MQ/consumer.js");
const redis = require("./config/Redis/myRedisClient");
const cookieParser = require("cookie-parser");
const router = express.Router();
const { startWebSocketLogStream } = require("./utils/websocketServer.js");
const http = require("http");
(async () => {
  await connectDB();
  await connectRabbitMQ(); // <-- wait for RabbitMQ to connect before consuming
  initConsumer();          // <-- now it's safe to start the consumer

  const app = express();
  const wsserver = http.createServer(app);

  startWebSocketLogStream(wsserver);

  wsserver.listen(3002, () => {
    console.log('WebSocket server running on port 3002');
  });

  app.use(cors({
    origin: "http://localhost:3001",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }));

  app.use(express.json());
  app.use(cookieParser(process.env.COOKIE_SECRET));

  app.use("/api/auth", require("./routes/auth.routes"));
  app.use("/api/transaction", require("./routes/transaction.routes"));
  app.use("/api/customer", require("./routes/customer.routes"));

  app.get('/mock-cybrid/rates', (req, res) => {
    const { from, to } = req.query;
    if (!from || !to) {
      return res.status(400).json({ error: 'Missing query parameters: from, to' });
    }

    if (from === 'USD' && to === 'USDC') {
      return res.json({ rate: 1.0 });
    } else if (from === 'USDC' && to === 'USD') {
      return res.json({ rate: 1.0 });
    } else {
      return res.status(400).json({ error: 'Unsupported currency pair' });
    }
  });

  app.use('/mock-cybrid', router);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();
