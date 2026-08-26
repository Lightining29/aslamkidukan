import mongoose from 'mongoose';

// Disable query buffering so Mongoose never hangs when MongoDB is not running
mongoose.set('bufferCommands', false);

export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri || uri.includes('127.0.0.1') || uri.includes('localhost')) {
    // If local MongoDB is not running, skip cleanly
    try {
      await mongoose.connect(uri || 'mongodb://127.0.0.1:27017/glowora', {
        serverSelectionTimeoutMS: 1500,
      });
      console.log('MongoDB connected');
    } catch {
      console.log('Running in Hostinger MySQL mode (MongoDB inactive).');
    }
    return;
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.log('Running in Hostinger MySQL mode.');
  }
}
