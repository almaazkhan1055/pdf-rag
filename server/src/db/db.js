import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB");
  } catch (error) {
    console.error(
      `OOPS! Something went wrong while connecting DB`,
      error.message,
    );
    throw error;
  }
};

export default connectDB;
