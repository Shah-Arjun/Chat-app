import { Server } from "socket.io"   // allows us to use socket.io in our backend
import http from "http"             // need this bcoz socket.io runs on top of http server
import express from "express"
import { ENV } from "./env.js"

const app = express()              // creates normal express app
const server = http.createServer(app)    // creates http server on top of express app

const io = new Server(server, {
    cors: {
        origin: [ENV.CLIENT_URL],
        credentials: true
    }
});



// apply authentication middleware to all socket connections
io.use(socketAuthMiddleware)