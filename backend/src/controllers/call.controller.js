import Call from "../models/call.model.js";

export const getCallHistory = async (req, res) => {
  try {
    const myId = req.user.id;
    const partnerId = req.params.id;
    const calls = await Call.find({
      $or: [
        { callerId: myId, receiverId: partnerId },
        { callerId: partnerId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(calls);
  } catch (error) {
    console.log("Error fetching call history", error);
    res.status(500).json({ message: "Error fetching call history" });
  }
};