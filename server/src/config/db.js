const mongoose = require('mongoose');
const dns = require('dns');
const config = require('./env');
const logger = require('./logger');

// Prefer IPv4 for SRV DNS resolution in Node.js 18+ cloud environments
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

let retries = 0;
const MAX_RETRIES = 5;

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.mongoose.url, config.mongoose.options);
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    if (error.message.includes('ENOTFOUND')) {
      logger.error('CRITICAL: MongoDB URI DNS resolution failed. Please verify MONGODB_URI in Render Environment settings.');
    }
    
    if (retries < MAX_RETRIES) {
      retries += 1;
      logger.info(`Retrying MongoDB connection in 5 seconds... (Attempt ${retries}/${MAX_RETRIES})`);
      setTimeout(connectDB, 5000);
    } else {
      logger.error(`Exhausted ${MAX_RETRIES} connection attempts to MongoDB. Exiting application.`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
