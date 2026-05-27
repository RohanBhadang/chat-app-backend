const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",

    info: {
      title: "Chat App API",
      version: "1.0.0",
      description: "Internal API documentation",
    },

    servers: [
      {
        url: "http://localhost:9000",
      },
      {
        url: "https://chatapi-9j7w.onrender.com",
      },
    ],
  },

  apis: ["./src/routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

console.log(swaggerSpec.paths);

module.exports = swaggerSpec;