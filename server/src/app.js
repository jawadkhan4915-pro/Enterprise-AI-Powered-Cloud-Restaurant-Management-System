const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config/env');
const routes = require('./routes');
const { errorConverter, errorHandler } = require('./middlewares/error.middleware');
const ApiError = require('./utils/ApiError');
const logger = require('./config/logger');

const path = require('path');
const app = express();

// Request logging in development
if (config.env === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
}

// Set security HTTP headers (disable CSP for asset load stability)
app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

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

// Serve uploads directory static resources (menu items images)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Serve static frontend files from client/dist
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

// Catch-all route to serve index.html for SPA router support
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next(new ApiError(404, 'API endpoint not found'));
  }
  res.sendFile(path.join(clientBuildPath, 'index.html'), (err) => {
    if (err) {
      next(new ApiError(404, 'Not Found'));
    }
  });
});

// Convert error to ApiError if needed
app.use(errorConverter);

// Handle errors
app.use(errorHandler);

module.exports = app;
