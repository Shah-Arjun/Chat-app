import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    callerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    callType: { type: String, enum: ["video", "audio"], default: "video" },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected", "missed", "cancelled"],
      default: "pending",
    },
    startedAt: { type: Date, default: Date.now },  // when the call was initiated
    connectedAt: { type: Date, default: null },      // when both peers connected
    endedAt: { type: Date, default: null },
    duration: { type: Number, default: 0 },          // in seconds
  },
  { timestamps: true }
);

callSchema.index({ callerId: 1, receiverId: 1, createdAt: 1 });

const Call = mongoose.model("Call", callSchema);
export default Call;