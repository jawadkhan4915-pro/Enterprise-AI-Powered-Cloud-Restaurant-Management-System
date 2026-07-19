const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const staffRolesMapping = {
  'branch_manager': 'manager',
  'cashier': 'cashier',
  'waiter': 'waiter',
  'chef': 'chef',
  'inventory_manager': 'other',
  'accountant': 'other'
};

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

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }), 'employees');

  for (const demo of demoUsers) {
    const user = await User.findOne({ email: demo.email });
    console.log(`Checking demo user email: ${demo.email}`);
    if (!user) {
      console.log(` -> User NOT found in DB!`);
      continue;
    }
    
    console.log(` -> User found: ${user.get('name')} | Role: ${user.get('role')}`);
    const mappedRole = staffRolesMapping[user.get('role')];
    console.log(` -> Mapped role: ${mappedRole}`);
    
    if (mappedRole) {
      const hasEmployee = await Employee.findOne({ userId: user._id });
      console.log(` -> Has employee in DB?`, !!hasEmployee);
      if (!hasEmployee) {
        console.log(` -> Seeding employee...`);
        const newEmp = await Employee.create({
          userId: user._id,
          name: user.get('name'),
          email: user.get('email'),
          phone: '+44 7911 123456',
          role: mappedRole,
          salary: user.get('role') === 'branch_manager' ? 30 : 15,
          hourlyRate: user.get('role') === 'branch_manager' ? 30 : 15,
          shift: { start: '09:00', end: '17:00' },
          status: 'active',
        });
        console.log(` -> Employee seeded: ${newEmp._id}`);
      }
    }
  }

  await mongoose.connection.close();
}

run().catch(console.error);
