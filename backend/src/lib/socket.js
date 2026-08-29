import { Server } from "socket.io"   // allows us to use socket.io in our backend
import http from "http"             // need this bcoz socket.io runs on top of http server
import express from "express"
import { ENV } from "./env.js"
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js"
import Call from "../models/call.model.js"

const app = express()              // creates normal express app
const server = http.createServer(app)    // creates http server on top of express app


// create socket.io server on top of http server
const io = new Server(server, {
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true
    }
});



// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware)         // runs before the connection event, checks if the user is authenticated or not, if not authenticated, disconnects the socket connection


// {userId: Set<socketId>} – tracks online users
const userSocketsMap = {}

export function getReceiverSocketId(receiverId) {
    if (!receiverId) return null;
    const socketSet = userSocketsMap[receiverId.toString()];
    if (!socketSet || socketSet.size === 0) return null;
    return Array.from(socketSet)[0];
}

// {socketId: { callId, otherUserId }} – tracks active calls per socket so we can auto-end on disconnect
const activeCallMap = {}

// Normalize a call document into the shape the frontend expects
function normalizeCall(call) {
    const obj = call.toObject ? call.toObject() : { ...call };
    return {
        ...obj,
        type: "call",
        senderId: obj.callerId,
        receiverId: obj.receiverId,
    };
}

// Emit updated call history to both participants
function emitCallHistory(call, socket, io) {
    if (!call) return;
    const item = normalizeCall(call);
    const callerId = call.callerId?.toString();
    const receiverId = call.receiverId?.toString();

    if (callerId) io.to(callerId).emit("call-history-updated", item);
    if (receiverId) io.to(receiverId).emit("call-history-updated", item);
}


io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.fullName}`)
    const userId = socket.userId;
    if (!userSocketsMap[userId]) {
        userSocketsMap[userId] = new Set();
    }
    userSocketsMap[userId].add(socket.id);
    socket.join(userId);
    
    // emit online users to all connected clients 
    io.emit("getOnlineUsers", Object.keys(userSocketsMap))  


    // ─── TYPING INDICATORS ──────────────────────────────────────────────────
    socket.on("typing:start", ({ to }) => {
        if (!to || to.toString() === userId) return;
        io.to(to.toString()).emit("typing:start", {
            from: userId,
        });
    });

    socket.on("typing:stop", ({ to }) => {
        if (!to || to.toString() === userId) return;
        io.to(to.toString()).emit("typing:stop", {
            from: userId,
        });
    });


    // ─── DISCONNECT ─────────────────────────────────────────────────────────────
    socket.on("disconnect", async () => {
        console.log(`User disconnected: ${socket.user?.fullName || userId}`)
        if (userSocketsMap[userId]) {
            userSocketsMap[userId].delete(socket.id);
            if (userSocketsMap[userId].size === 0) {
                delete userSocketsMap[userId];
            }
        }
        io.emit("getOnlineUsers", Object.keys(userSocketsMap))

        // If this socket was in an active call, notify the peer and end the call
        const activeCall = activeCallMap[socket.id];
        if (activeCall) {
            const { callId, otherUserId } = activeCall;
            delete activeCallMap[socket.id];

            try {
                const call = await Call.findById(callId);
                if (call && ["pending", "completed"].includes(call.status)) {
                    const wasConnected = call.status === "completed";
                    const endedAt = new Date();
                    const duration = wasConnected && call.connectedAt
                        ? Math.max(0, Math.floor((endedAt - call.connectedAt) / 1000))
                        : 0;

                    const updatedCall = await Call.findByIdAndUpdate(
                        callId,
                        { status: wasConnected ? "completed" : "cancelled", endedAt, duration },
                        { new: true }
                    );
                    emitCallHistory(updatedCall, socket, io);
                }
            } catch (err) {
                console.error("Error auto-ending call on disconnect:", err);
            }

            // Notify the other peer
            io.to(otherUserId.toString()).emit("call-ended", { from: userId, callId });
        }
    });


    // ─── START A CALL ────────────────────────────────────────────────────────────
    socket.on("call-user", async ({ to, offer, callType = "video" }) => {
        if (!to || to.toString() === userId) return;
        const targetOnline = userSocketsMap[to.toString()] && userSocketsMap[to.toString()].size > 0;
        const validCallType = callType === "audio" ? "audio" : "video";

        try {
            if (!targetOnline) {
                // Target is offline – create as missed immediately
                const call = await Call.create({
                    callerId: userId,
                    receiverId: to,
                    callType: validCallType,
                    status: "missed",
                });
                emitCallHistory(call, socket, io);
                socket.emit("call-rejected", { from: to, reason: "offline", callId: call._id });
                return;
            }

            // Target is online and available – create as pending
            const call = await Call.create({
                callerId: userId,
                receiverId: to,
                callType: validCallType,
                status: "pending",
            });
            emitCallHistory(call, socket, io);

            // Track this call on the caller's socket
            activeCallMap[socket.id] = { callId: call._id.toString(), otherUserId: to.toString(), callType: validCallType };

            io.to(to.toString()).emit("incoming-call", {
                offer,
                callId: call._id,
                callType: validCallType,
                caller: { _id: socket.userId, fullName: socket.user.fullName, profilePic: socket.user.profilePic },
            });
        } catch (err) {
            console.error("Error in call-user:", err);
        }
    });


    // ─── ACCEPT A CALL ───────────────────────────────────────────────────────────
    socket.on("call-accepted", async ({ to, answer, callId }) => {
        if (!to || !callId) return;

        try {
            const connectedAt = new Date();
            // Mark as completed (connected) and record when they connected
            const call = await Call.findOneAndUpdate(
                { _id: callId, callerId: to, receiverId: userId },
                { status: "completed", connectedAt },
                { new: true }
            );
            emitCallHistory(call, socket, io);

            // Track this call on the receiver's socket too
            activeCallMap[socket.id] = { callId: callId.toString(), otherUserId: to.toString(), callType: call?.callType || "video" };

            io.to(to.toString()).emit("call-accepted", {
                from: socket.userId,
                answer,
                callId: call?._id,
                callType: call?.callType || "video",
            });
        } catch (err) {
            console.error("Error in call-accepted:", err);
        }
    });


    // ─── REJECT A CALL ───────────────────────────────────────────────────────────
    socket.on("call-rejected", async ({ to, callId, status }) => {
        if (!to) return;

        delete activeCallMap[socket.id];

        try {
            const finalStatus = status === "missed" ? "missed" : "rejected";
            const call = await Call.findOneAndUpdate(
                { _id: callId, callerId: to, receiverId: userId },
                { status: finalStatus, endedAt: new Date() },
                { new: true }
            );
            emitCallHistory(call, socket, io);

            io.to(to.toString()).emit("call-rejected", {
                from: socket.userId,
                callId: call?._id,
                reason: finalStatus,
            });
        } catch (err) {
            console.error("Error in call-rejected:", err);
        }
    });


    // ─── ICE CANDIDATE ───────────────────────────────────────────────────────────
    socket.on("ice-candidate", ({ to, candidate }) => {
        if (!to || !candidate) return;
        io.to(to.toString()).emit("ice-candidate", {
            from: socket.userId,
            candidate,
        });
    });


    // ─── END CALL ────────────────────────────────────────────────────────────────
    socket.on("call-ended", async ({ to, callId, accepted }) => {
        if (!to) return;

        // Clean up active call tracking
        delete activeCallMap[socket.id];

        try {
            const call = await Call.findOne({
                _id: callId,
                $or: [
                    { callerId: userId, receiverId: to },
                    { callerId: to, receiverId: userId }
                ]
            });

            if (call) {
                const endedAt = new Date();
                const wasConnected = accepted || call.status === "completed";
                const duration = wasConnected && call.connectedAt
                    ? Math.max(0, Math.floor((endedAt - call.connectedAt) / 1000))
                    : 0;

                const updatedCall = await Call.findByIdAndUpdate(
                    call._id,
                    {
                        status: wasConnected ? "completed" : "cancelled",
                        endedAt,
                        duration
                    },
                    { new: true }
                );
                emitCallHistory(updatedCall, socket, io);
            }
        } catch (err) {
            console.error("Error in call-ended:", err);
        }

        io.to(to.toString()).emit("call-ended", {
            from: socket.userId,
            callId,
        });
    });
})


export { io, app, server }