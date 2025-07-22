// server.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");

connectDB();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth.routes"));



(async () => {
  connectDB();


  // Example route injection with db (optional pattern)
//   app.use("/api/transactions", require("./routes/transactions.routes")(db));
//   app.use("/api/log", require("./routes/audit.routes")(db));
//   app.use("/api/auth", require("./routes/auth.routes"));
//   app.use("/api/rates", require("./routes/rates.routes"));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
})();
