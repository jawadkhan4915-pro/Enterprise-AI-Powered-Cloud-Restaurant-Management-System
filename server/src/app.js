const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');
const logger = require('./config/logger');

const app = express();

// Request logging in development
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Set security HTTP headers
app.use(helmet());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Enable CORS
app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);

// Mount API routes
app.use('/api', routes);

// Send back a 404 error for any unknown API request
app.use((req, res, next) => {
  next(new ApiError(404, 'API endpoint not found'));
});

// Convert error to ApiError if needed
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

module.exports = app;
