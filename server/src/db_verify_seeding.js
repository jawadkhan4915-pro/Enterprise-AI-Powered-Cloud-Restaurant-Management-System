const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI;

async function run() {
  await mongoose.connect(MONGODB_URI);
  console.log('Connected!');

  const Category = mongoose.model('Category', new mongoose.Schema({}, { strict: false }), 'categories');
  const MenuItem = mongoose.model('MenuItem', new mongoose.Schema({}, { strict: false }), 'menuitems');
  const Employee = mongoose.model('Employee', new mongoose.Schema({}, { strict: false }), 'employees');

  const categories = await Category.find({});
  console.log(`--- MENU SEEDING STATUS ---`);
  console.log(`Categories count: ${categories.length}`);
  
  for (const cat of categories) {
    const items = await MenuItem.find({ categoryId: cat._id });
    console.log(`Category: ${cat.get('name')} | Items count: ${items.length}`);
    const prepTimes = items.map(i => i.get('preparationTime'));
    const uniquePrepTimes = [...new Set(prepTimes)];
    console.log(` - Unique preparationTimes:`, uniquePrepTimes);
  }

  console.log(`--- DEMO EMPLOYEES STATUS ---`);
  const employees = await Employee.find({});
  console.log(`Total employees in DB: ${employees.length}`);
  employees.forEach(emp => {
    console.log(`Employee: ${emp.get('name')} | Role: ${emp.get('role')} | userId linked: ${emp.get('userId') ? 'YES' : 'NO'}`);
  });

  await mongoose.connection.close();
}

run().catch(console.error);
