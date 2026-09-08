const express = require('express');
const cors = require('cors');
const propertyRoutes = require('./routes/propertyRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Real Estate API is running');
});

app.use('/api/properties', propertyRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
