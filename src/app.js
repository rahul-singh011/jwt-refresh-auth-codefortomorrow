const express = require("express")
const authRoutes = require("./routes/authRoutes")
const errorHandler = require("./middleware/errHandler");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req,res)=> this.response.send("JWT refresh-token auht API is running"));


app.use(errorHandler);

module.exports = app;