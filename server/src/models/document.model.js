import mongoose from "mongoose";

const documentSchema = new mongoose.Schema(
  {
    originalName: {
      type: String,
      required: true,
    },

    filename: {
      type: String,
      required: true,
    },

    path: {
      type: String,
      required: true,
    },

    mimetype: {
      type: String,
      required: true,
    },

    size: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: ["queued", "processing", "completed", "failed"],
      default: "queued",
    },

    error: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

const Document = mongoose.model("Document", documentSchema);

export default Document;
