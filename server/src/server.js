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

    // Seed Restaurant & Branch if empty
    const Restaurant = require('./models/Restaurant.model');
    const Branch = require('./models/Branch.model');
    const Floor = require('./models/Floor.model');
    const Table = require('./models/Table.model');
    const Category = require('./models/Category.model');

    let restaurant = await Restaurant.findOne();
    if (!restaurant) {
      logger.info('Seeding default restaurant and branch profile...');
      restaurant = await Restaurant.create({
        name: 'RestaurantOS AI HQ',
        currency: 'USD',
        address: '100 Baker St, London, UK',
        phone: '+44 20 7946 0958',
        email: 'info@restaurantos.ai',
      });
    }

    let branch = await Branch.findOne({ restaurantId: restaurant._id });
    if (!branch) {
      branch = await Branch.create({
        restaurantId: restaurant._id,
        name: 'London Central Branch',
        address: '100 Baker St, London, UK',
        phone: '+44 20 7946 0958',
      });
    }

    let floor = await Floor.findOne({ branchId: branch._id });
    if (!floor) {
      logger.info('Seeding default floor level...');
      floor = await Floor.create({
        branchId: branch._id,
        name: 'Ground Floor',
        level: 0,
      });
    }

    const tableCount = await Table.countDocuments({ branchId: branch._id });
    if (tableCount === 0) {
      logger.info('Seeding initial floor layout tables...');
      const defaultTables = [
        { branchId: branch._id, floorId: floor._id, number: '1', capacity: 2, shape: 'square', position: { x: 80, y: 80 } },
        { branchId: branch._id, floorId: floor._id, number: '2', capacity: 4, shape: 'square', position: { x: 200, y: 80 } },
        { branchId: branch._id, floorId: floor._id, number: '3', capacity: 4, shape: 'circle', position: { x: 340, y: 80 } },
        { branchId: branch._id, floorId: floor._id, number: '4', capacity: 6, shape: 'square', position: { x: 80, y: 220 } },
        { branchId: branch._id, floorId: floor._id, number: '5', capacity: 2, shape: 'circle', position: { x: 240, y: 220 } },
        { branchId: branch._id, floorId: floor._id, number: 'Bar-1', capacity: 1, shape: 'circle', position: { x: 380, y: 220 } },
      ];
      await Table.insertMany(defaultTables);
    }

    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      logger.info('Seeding default menu categories...');
      const defaultCategories = [
        { restaurantId: restaurant._id, name: 'Starters', slug: 'starters', order: 1 },
        { restaurantId: restaurant._id, name: 'Main Course', slug: 'mains', order: 2 },
        { restaurantId: restaurant._id, name: 'Desserts', slug: 'desserts', order: 3 },
        { restaurantId: restaurant._id, name: 'Beverages', slug: 'beverages', order: 4 },
      ];
      await Category.insertMany(defaultCategories);
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
