import ConversationsList from "../models/conversationsList.model.js";

export const getConversationsList = async (req, res) => {
  try {
    const conversationsList = await ConversationsList.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      message: "testinggg",
      conversationsList,
    });
  } catch (error) {
    console.error("Get conversation list error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to load conversation list.",
    });
  }
};
