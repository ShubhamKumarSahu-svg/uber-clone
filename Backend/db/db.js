const mongoose = require('mongoose');

async function connectToDb() {
  try {
    await mongoose.connect(process.env.DB_CONNECT);
    console.log('✅ Connected to DB');
  } catch (err) {
    console.error('❌ DB connection error:', err);
  }
}

module.exports = connectToDb;
