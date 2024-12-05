import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || "");
    console.log("Connexion à MongoDB réussie !");
  } catch (error) {
    console.error("Erreur lors de la connexion à MongoDB :", error);
    process.exit(1);
  }
};

export default connectDB;
