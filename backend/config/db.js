const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB холбогдлоо: ${conn.connection.host}`);
  } catch (err) {
    console.error(`❌ MongoDB холболт амжилтгүй: ${err.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
