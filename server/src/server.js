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

    const User = require('./models/User.model');
    const demoUsers = [
      { name: 'Owner User', email: 'owner@test.com', role: 'restaurant_owner' },
      { name: 'Manager User', email: 'manager@test.com', role: 'branch_manager' },
      { name: 'Cashier User', email: 'cashier@test.com', role: 'cashier' },
      { name: 'Waiter User', email: 'waiter@test.com', role: 'waiter' },
      { name: 'Chef User', email: 'chef@test.com', role: 'chef' },
      { name: 'Inventory User', email: 'inventory@test.com', role: 'inventory_manager' },
      { name: 'Accountant User', email: 'accountant@test.com', role: 'accountant' },
      { name: 'Customer User', email: 'customer@test.com', role: 'customer' },
      { name: 'Rider User', email: 'rider@test.com', role: 'delivery_rider' }
    ];

    for (const demo of demoUsers) {
      const hasUser = await User.findOne({ email: demo.email });
      if (!hasUser) {
        logger.info(`Seeding default test ${demo.role} user...`);
        await User.create({
          name: demo.name,
          email: demo.email,
          password: 'Password@123',
          role: demo.role,
          isEmailVerified: true,
          isActive: true,
        });
        logger.info(`Default test ${demo.role} user seeded successfully.`);
      }
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

    // Seed default inventory items if empty
    const InventoryItem = require('./models/InventoryItem.model');
    const Supplier = require('./models/Supplier.model');

    const inventoryCount = await InventoryItem.countDocuments();
    if (inventoryCount === 0) {
      logger.info('Seeding default inventory items and supplier...');
      const supplier = await Supplier.create({
        restaurantId: restaurant._id,
        name: 'FreshMart Suppliers',
        contactName: 'James Collins',
        phone: '+44 20 7946 1234',
        email: 'orders@freshmart.co.uk',
        address: '45 Market Street, London, UK',
      });

      await InventoryItem.insertMany([
        { branchId: branch._id, supplierId: supplier._id, name: 'Salmon Fillet', sku: 'ING-001', category: 'ingredient', unit: 'kg', currentStock: 10, minimumStock: 2, costPerUnit: 18 },
        { branchId: branch._id, supplierId: supplier._id, name: 'Chicken Breast', sku: 'ING-002', category: 'ingredient', unit: 'kg', currentStock: 15, minimumStock: 3, costPerUnit: 8 },
        { branchId: branch._id, supplierId: supplier._id, name: 'Olive Oil', sku: 'ING-003', category: 'ingredient', unit: 'liter', currentStock: 5, minimumStock: 1, costPerUnit: 12 },
        { branchId: branch._id, supplierId: supplier._id, name: 'Pasta Penne', sku: 'ING-004', category: 'ingredient', unit: 'kg', currentStock: 20, minimumStock: 5, costPerUnit: 3 },
        { branchId: branch._id, supplierId: supplier._id, name: 'Mineral Water 500ml', sku: 'BEV-001', category: 'beverage', unit: 'piece', currentStock: 100, minimumStock: 20, costPerUnit: 0.5 },
        { branchId: branch._id, supplierId: supplier._id, name: 'Coca-Cola Can', sku: 'BEV-002', category: 'beverage', unit: 'piece', currentStock: 80, minimumStock: 15, costPerUnit: 0.9 },
        { branchId: branch._id, name: 'Disposable Gloves', sku: 'SUP-001', category: 'supply', unit: 'piece', currentStock: 200, minimumStock: 50, costPerUnit: 0.1 },
      ]);
    }

    // Seed default customers
    const Customer = require('./models/Customer.model');
    const customerCount = await Customer.countDocuments();
    let seededCustomer;
    if (customerCount === 0) {
      logger.info('Seeding default customer profiles...');
      seededCustomer = await Customer.create({
        name: 'Alice Smith',
        phone: '+44 7911 123456',
        email: 'alice.smith@example.com',
        loyaltyPoints: 250, // Starts at silver tier
        visitCount: 12,
        totalSpent: 340.50,
      });
      await Customer.create({
        name: 'Bob Jones',
        phone: '+44 7911 654321',
        email: 'bob.jones@example.com',
        loyaltyPoints: 600, // Starts at gold tier
        visitCount: 24,
        totalSpent: 890.00,
      });
    } else {
      seededCustomer = await Customer.findOne();
    }

    // Seed default reservations
    const Reservation = require('./models/Reservation.model');
    const reservationCount = await Reservation.countDocuments();
    if (reservationCount === 0 && seededCustomer) {
      logger.info('Seeding default reservations...');
      const Table = require('./models/Table.model');
      const table = await Table.findOne({ branchId: branch._id });

      const reservationTime = new Date();
      reservationTime.setDate(reservationTime.getDate() + 1); // tomorrow
      reservationTime.setHours(19, 0, 0, 0); // 7:00 PM

      await Reservation.create({
        customerId: seededCustomer._id,
        customerName: seededCustomer.name,
        customerPhone: seededCustomer.phone,
        branchId: branch._id,
        tableId: table ? table._id : null,
        partySize: 4,
        reservationTime,
        status: 'confirmed',
        notes: 'Needs high chair for toddler.',
      });
    }

    // Seed default employees
    const Employee = require('./models/Employee.model');
    const employeeCount = await Employee.countDocuments();
    if (employeeCount === 0) {
      logger.info('Seeding default employees...');
      await Employee.create({
        name: 'John Miller',
        email: 'john.miller@restaurant.com',
        phone: '+44 7911 777888',
        role: 'waiter',
        salary: 15,
        hourlyRate: 15,
        shift: { start: '08:00', end: '16:00' },
        status: 'active',
      });
      await Employee.create({
        name: 'Sarah Connor',
        email: 'sarah.connor@restaurant.com',
        phone: '+44 7911 999000',
        role: 'chef',
        salary: 25,
        hourlyRate: 25,
        shift: { start: '14:00', end: '22:00' },
        status: 'active',
      });
    }

    // Seed default expenses
    const Expense = require('./models/Expense.model');
    const expenseCount = await Expense.countDocuments();
    if (expenseCount === 0) {
      logger.info('Seeding default expenses...');
      const User = require('./models/User.model');
      const ownerUser = await User.findOne({ email: 'owner@test.com' });

      await Expense.create({
        branchId: branch._id,
        category: 'utilities',
        amount: 250.00,
        description: 'Monthly electricity bill - June',
        date: new Date(),
        status: 'paid',
        paymentMethod: 'bank_transfer',
        performedBy: ownerUser ? ownerUser._id : null,
      });

      await Expense.create({
        branchId: branch._id,
        category: 'inventory',
        amount: 500.00,
        description: 'Meat and seafood weekly supply order',
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'paid',
        paymentMethod: 'card',
        performedBy: ownerUser ? ownerUser._id : null,
      });
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
