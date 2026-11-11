require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const seedAdmin = async () => {
  const { ADMIN_EMAIL, ADMIN_PASSWORD, MONGO_URI } = process.env;

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || !MONGO_URI) {
    throw new Error('ADMIN_EMAIL, ADMIN_PASSWORD, and MONGO_URI must be set');
  }

  await mongoose.connect(MONGO_URI);

  const email = ADMIN_EMAIL.trim().toLowerCase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error(`A user with email ${email} already exists`);
  }

  const admin = await User.create({
    name: 'Admin',
    email,
    password: ADMIN_PASSWORD,
    role: 'admin',
  });

  console.log(`Admin user created: ${admin.email}`);
};

seedAdmin()
  .catch((error) => {
    console.error('Unable to seed admin:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
