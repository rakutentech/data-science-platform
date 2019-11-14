import express from 'express';
import path from 'path';
import v1 from './api/v1'

const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json'); // Created by: yarn run swagger
const adminSwaggerDocument = require('./adminSwagger.json'); // Created by: yarn run swagger

const app = express();

app.use('/api/v1', v1)
app.use(express.static(path.join('./', 'dist')));
//lazy load by callback function
const userSchema = schema => (...args) => swaggerUi.setup(schema)(...args)

app.use('/api-docs', swaggerUi.serve, userSchema(swaggerDocument));
app.use('/admin-api-docs', swaggerUi.serve, userSchema(adminSwaggerDocument));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'))
})

app.listen(3001, ()=> {
  console.log('server running');
})
