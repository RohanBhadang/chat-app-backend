const swaggerJsdoc = require("swagger-jsdoc");

const routesPath = "src/routes/*.js";

console.log("Swagger Routes Path:", routesPath);

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
      },{
        url:"https://chatapi-9j7w.onrender.com"
      },

    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },

    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [routesPath],
};

const swaggerSpec = swaggerJsdoc(options);

console.log(JSON.stringify(swaggerSpec.paths, null, 2));

module.exports = swaggerSpec;