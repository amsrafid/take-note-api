const mongoose = require('mongoose');

const connectTestDB = (dbName) => mongoose.connect(process.env.MONGODB_URI, { dbName });

const disconnectTestDB = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

module.exports = { connectTestDB, disconnectTestDB };
