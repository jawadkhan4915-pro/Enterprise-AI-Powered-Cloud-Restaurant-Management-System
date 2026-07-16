const http = require('http');
const socketIo = require('socket.io');
const app = require('./app');
const config = require('./config/env');
const connectDB = async () => {
  try {
    await require('./config/db')();
  } catch (err) {
    logger.error('Database connection failed: ', err);
  }
};
const logger = require('./config/logger');

// Bootstrapping the HTTP server
const server = http.createServer(app);

// Bootstrap Socket.IO with CORS policies
const io = socketIo(server, {
  cors: {
    origin: config.clientUrl,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Seed system permissions and roles if database is empty
const seedDatabase = async () => {
  try {
    const Role = require('./models/Role.model');
    const Permission = require('./models/Permission.model');
    const { SYSTEM_ROLES_PERMISSIONS } = require('./middlewares/rbac.middleware');

    const permissionCount = await Permission.countDocuments();
    if (permissionCount === 0) {
      logger.info('Seeding default permissions...');
      const defaultPermissions = [];
      const modules = ['auth', 'branch', 'menu', 'orders', 'inventory', 'crm', 'employees', 'finance', 'reports'];
      
      modules.forEach((mod) => {
        ['create', 'read', 'update', 'delete', 'manage'].forEach((action) => {
          defaultPermissions.push({
            name: `${action.toUpperCase()} ${mod.toUpperCase()}`,
            slug: `${action}_${mod}`,
            module: mod,
            action: action,
            description: `Allows user to ${action} ${mod} items`,
          });
        });
      });
      
      await Permission.insertMany(defaultPermissions);
      logger.info('Default permissions seeded successfully.');
    }

    const roleCount = await Role.countDocuments();
    if (roleCount === 0) {
      logger.info('Seeding default roles...');
      const roleDocs = Object.keys(SYSTEM_ROLES_PERMISSIONS).map((roleName) => ({
        name: roleName.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        slug: roleName,
        permissions: SYSTEM_ROLES_PERMISSIONS[roleName],
        isSystem: true,
        description: `Predefined system role for ${roleName}`,
      }));
      await Role.insertMany(roleDocs);
      logger.info('Default roles seeded successfully.');
    }
  } catch (error) {
    logger.error('Error seeding roles/permissions:', error);
  }
};

// Global error handlers
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(error);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});

// Socket.IO Events
io.on('connection', (socket) => {
  logger.debug(`New client connected: ${socket.id}`);
  
  socket.on('disconnect', () => {
    logger.debug(`Client disconnected: ${socket.id}`);
  });
});

// Attach Socket.IO to express app context
app.set('io', io);

// Connect DB and start server
const startServer = async () => {
  await connectDB();
  await seedDatabase();

  server.listen(config.port, () => {
    logger.info(`Server listening on port ${config.port} in ${config.env} mode`);
  });
};

startServer();
