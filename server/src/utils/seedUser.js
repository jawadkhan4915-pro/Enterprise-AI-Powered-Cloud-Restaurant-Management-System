const mongoose = require('mongoose');
const User = require('../models/User.model');
const config = require('../config/env');

const seedUser = async () => {
  try {
    await mongoose.connect(config.mongoose.url);
    console.log('Connected to MongoDB for seeding...');

    // Delete existing test user if any
    await User.deleteOne({ email: 'owner@test.com' });

    const newUser = new User({
      name: 'Owner User',
      email: 'owner@test.com',
      password: 'Password@123',
      role: 'restaurant_owner',
      isEmailVerified: true,
      isActive: true,
    });

    await newUser.save();
    console.log('Test User successfully seeded:');
    console.log('Email: owner@test.com');
    console.log('Password: Password@123');
    console.log('Role: restaurant_owner');
    console.log('Email Verified: true');
  } catch (error) {
    console.error('Error seeding test user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

seedUser();
