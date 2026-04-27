require("dotenv").config();
const express = require("express");
const cors = require("cors");

const audioRoute = require("./routes/audio");
const alertRoute = require("./routes/alert");
const aiRoute = require("./routes/ai");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
}));
app.use(express.json({ limit: "10mb" }));

app.get("/", (req, res) => {
  res.json({ status: "✅ Predictive Emergency AI Backend is running" });
});

app.use("/api/audio", audioRoute);
app.use("/api/alert", alertRoute);
app.use("/api/ai", aiRoute);

app.listen(PORT, () => {
  console.log(`🚀 Backend running on http://localhost:${PORT}`);
});
