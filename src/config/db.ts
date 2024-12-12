import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;

    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the environment variables');
    }

    await mongoose.connect(mongoURI);

    console.log('Connexion à MongoDB réussie !');
  } catch (error) {
    console.error('Erreur lors de la connexion à MongoDB :', error);
    process.exit(1);
  }
};

export default connectDB;