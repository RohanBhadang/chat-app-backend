require("dotenv").config();
const express = require("express");
const cors = require("cors");
const basicAuth = require("express-basic-auth");

const chatRoutes = require("./routes/chat.routes");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const requestRoutes = require("./routes/request.routes");

const errorHandler = require("./middlewares/error.middleware");

const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

const app = express();
console.log("USER:", process.env.SWAGGER_USER);
console.log("PASS:", process.env.SWAGGER_PASS);

const CLIENT_URL =
  process.env.CLIENT_URL ||
  process.env.CORS_ORIGIN ||
  "*";

const corsOptions = {
  origin: CLIENT_URL,
  credentials: true,
};

console.log("Routes loaded");

app.use(cors(corsOptions));

app.use(express.json());

/**
 * SWAGGER DOCS WITH PASSWORD PROTECTION
 */
app.use(
  "/api-docs",

  basicAuth({
    users: {
      [process.env.SWAGGER_USER]:
        process.env.SWAGGER_PASS,
    },

    challenge: true,
  }),

  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

// ROUTES
app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/users", userRoutes);

app.use("/api/requests", requestRoutes);

// GLOBAL ERROR HANDLER
app.use(errorHandler);

module.exports = app;