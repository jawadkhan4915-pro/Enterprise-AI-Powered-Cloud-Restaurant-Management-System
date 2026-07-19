const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
  const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }), 'employees');

  const user = await User.findOne({ email: 'manager@test.com' });
  console.log('--- USER ---');
  if (user) {
    console.log(`User ID: ${user._id} (type: ${typeof user._id})`);
    console.log(`User Name: ${user.name}`);
  } else {
    console.log('User not found!');
  }

  const employee = await Employee.findOne({ email: 'manager@test.com' });
  console.log('--- EMPLOYEE ---');
  if (employee) {
    console.log(`Employee ID: ${employee._id}`);
    console.log(`Employee userId field: ${employee.userId} (type: ${typeof employee.userId})`);
    console.log(`Are they equal?`, user ? user._id.toString() === employee.userId.toString() : false);
  } else {
    console.log('Employee not found!');
  }

  // Also query using findOne({ userId: user._id })
  if (user) {
    const empByUserId = await Employee.findOne({ userId: user._id });
    console.log(`Query by userId: ${user._id} -> found:`, !!empByUserId);
    if (empByUserId) {
      console.log(` -> Found employee ID: ${empByUserId._id}`);
    }
  }

  await mongoose.connection.close();
}

run().catch(console.error);
