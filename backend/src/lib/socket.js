import { Server } from "socket.io"   // allows us to use socket.io in our backend
import http from "http"             // need this bcoz socket.io runs on top of http server
import express from "express"
import { ENV } from "./env.js"
import { socketAuthMiddleware } from "../middleware/socket.auth.middleware.js"

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


export function getReceiverSocketId(receiverId) {
    return socketUserMap[receiverId]
}

// this is for storing online user
const socketUserMap = {}          // key:value pair {userId: socketId} to keep track of online users, tells which user is connected to which socket


io.on("connection", (socket) => {
    console.log(`User connected: ${socket.user.fullName}`)
    const userId = socket.userId;
    socketUserMap[userId] = socket.id;         // store the socketId for the connected user
    
    // emit online users to all connected clients 
    io.emit("getOnlineUsers", Object.keys(socketUserMap))  

    // with socket.on, we can listen to events form the client side
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.user.fullName}`)
        delete socketUserMap[userId];
        io.emit("getOnlineUsers", Object.keys(socketUserMap))  // emit updated online users to all connected clients
    })
})


export { io, app, server }