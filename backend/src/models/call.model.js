import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    callerId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", required: true 
    },
    receiverId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", required: true 
    },
    callType: { 
      type: String, 
      enum: ["video", "audio"], 
      default: "video" 
    },
    status: {
      type: String,
      enum: ["pending", "completed", "rejected", "missed", "cancelled"],
      default: "pending",
    },
    startedAt: {  // when the call was initiated
      type: Date, 
      default: Date.now 
    },  
    connectedAt: {   // when the call was answered
      type: Date, 
      default: null 
    },     
    endedAt: {  // when the call was ended
      type: Date, 
      default: null 
    },
    duration: {   // in seconds
      type: Number, 
      default: 0 
    },         
  },
  { 
    timestamps: true 
  }
);

callSchema.index({ callerId: 1, receiverId: 1, createdAt: 1 });

const Call = mongoose.model("Call", callSchema);
export default Call;