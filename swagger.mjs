import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';


import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const swaggerDefinition = {
  info: {
    title: "API.Runner back-end's API",
    version: '0.5.0',
    description:
      'This is a REST API application made with Express. It retrieves data from JSONPlaceholder.',
    license: {
      name: 'Licensed Under WTFPL',
      url: 'https://en.wikipedia.org/wiki/WTFPL',
    },
    contact: {
      name: 'APIRunner Discord',
      url: 'https://discord.gg/FTkj9xUvHh',
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ['./routes/**/*.*'],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;