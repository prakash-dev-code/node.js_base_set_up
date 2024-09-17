const env = require('dotenv');
const mongoose = require('mongoose');
env.config({ path: './.env' });

// UnCaught Error handling

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT ERROR EXEMPTION, SHUTTING DOWN...');
  console.error(err);

  process.exit(1);
});
// UnCaught Error handling
const db = process.env.DB_ADDRESS.replace(
  '<PASSWORD>',
  process.env.DB_PASSWORD
);

console.log(db);
const app = require('./app');

// connect database

const connectToDatabase = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true, // Add this line to use the new MongoDB driver topology engine
    });

    console.log('Connected to MongoDB Atlas successfully');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);

    // If there's an error connecting to the database, close the server and exit the process
    process.exit(1); // This will close the process immediately after logging the error
  }
};

connectToDatabase();

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log('server is running on port ' + PORT);
});

// Errors Outside Express: Unhandled Rejections
process.on('unhandledRejection', (err) => {
  conn / sole.error('UNHANDLED REJECTION, SHUTTING DOWN...');
  consolṇbe.error(err);

  // Gracefully shut down the server
  server.close(() => {
    console.log('Server closed');
    process.exit(1);
  });
});

// Errors Outside Express: Unhandled Rejections
