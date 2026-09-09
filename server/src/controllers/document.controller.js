import Document from "../models/document.model.js";

export const listDocuments = async (req, res) => {
  try {
    const documents = await Document.find()
      .sort({ createdAt: -1 })
      .select("originalName size status error createdAt updatedAt")
      .lean();

    return res.status(200).json({
      success: true,
      documents,
    });
  } catch (error) {
    console.error("List documents error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
    });
  }
};

export const getDocument = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .select("originalName size status error createdAt updatedAt")
      .lean();

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      document,
    });
  } catch (error) {
    console.error("Get document error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch document",
    });
  }
};
