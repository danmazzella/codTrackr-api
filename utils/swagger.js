// NPM Modules
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

module.exports = function (app) {
  // -- setup up swagger-jsdoc --
  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'COD Trackr',
      version: '1.0.0',
    },
    host: 'localhost:8081',
    basePath: '/',
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'Authorization',
        },
      },
    },
  };
  const options = {
    swaggerDefinition,
    apis: ['routes/*.js'],
  };
  const swaggerSpec = swaggerJSDoc(options);

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
