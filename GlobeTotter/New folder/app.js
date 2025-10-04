const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require('cookie-parser');

require("dotenv").config();

const app = express();

// CORS configuration for credentials
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL
  ].filter(Boolean), // Remove any undefined values
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());



mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("Database connected successfully");
})
.catch((err) => {console.error("Database connection failed:", err);});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/trips", require("./routes/tripRoutes"));
app.use("/api/budgets", require("./routes/budgetRoutes"));
app.use("/api/activities", require("./routes/activityroutes"));

app.get("/", (req, res) => {
    res.send("Welcome to the GlobeTrotter API");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
});