import mongoose from "mongoose";

const conversationsListSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const ConversationsList = mongoose.model(
  "Conversations",
  conversationsListSchema,
);

export default ConversationsList;
