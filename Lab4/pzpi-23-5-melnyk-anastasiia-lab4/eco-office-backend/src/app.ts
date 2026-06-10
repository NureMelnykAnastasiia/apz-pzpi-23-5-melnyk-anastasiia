import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import routes from './routes';
import path from 'path'; // 1. Імпортуємо модуль path

const app = express();

app.use(cors());
app.use(express.json());

// Визначаємо шляхи до файлів маршрутів
// Використовуємо абсолютні шляхи для надійності
const routesPathTS = path.join(__dirname, 'routes', '*.ts');
const routesPathJS = path.join(__dirname, 'routes', '*.js');

console.log('Swagger is looking for docs in:', routesPathTS, 'and', routesPathJS);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'EcoOffice API',
      version: '1.0.0',
      description: 'API documentation for EcoOffice',
    },
    servers: [
      {
        url: 'http://localhost:3000',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  // 2. ВИПРАВЛЕННЯ:
  // Вказуємо окремо для .ts та .js, щоб уникнути проблем з glob-патернами на різних ОС
  apis: [routesPathTS, routesPathJS], 
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// http://localhost:3000/api-docs.json
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerDocs);
});


app.use('/api', routes);

app.get('/', (req, res) => {
  res.send('EcoOffice API is running. Docs: <a href="/api-docs">/api-docs</a>');
});

export default app;