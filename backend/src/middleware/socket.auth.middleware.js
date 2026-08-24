import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ENV } from '../lib/env.js';

export const socketAuthMiddleware = async (socket, next) => {
    try {
        // extract token from http-only cookies
        const token = socket.handshake.headers.cookie?.split('; ').find(cookie => cookie.startsWith('token=')).split('=')[1];

        if (!token) {
            // console.log("Socket connection rejected. No token provided.")    //debug
            return next(new Error('Unauthorized - Token not found'));
        }

        // verify token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded) {
            // console.log("Socket connection rejected. Invalid token.")   //debug
            return next(new Error('Unauthorized - Invalid token'))
        }
        
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            // console.log("Socket connection rejected. User not found.")   //debug
            return next(new Error('Unauthorized - User not found'));
        }

        // attach user info to socket object
        socket.user = user;
        socket.userId = user._id.toString()

        // console.log(`Socket authentication for user: ${user.fullName} ${user._id}`)   //debug

        next();
    } catch (error) {
        console.log("Error in socket authentication", error.message);
        return next(new Error('Unauthorized - Internal server error'));
    }
}