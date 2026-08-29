import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import { ENV } from '../lib/env.js';

function getCookie(cookieHeader, name) {
    if (!cookieHeader) return null;
    const cookies = cookieHeader.split(';');
    for (let c of cookies) {
        const [key, ...v] = c.trim().split('=');
        if (key === name) {
            return decodeURIComponent(v.join('='));
        }
    }
    return null;
}

export const socketAuthMiddleware = async (socket, next) => {
    try {
        // extract token from http-only cookies or handshake auth
        const token = getCookie(socket.handshake.headers?.cookie, 'token') || socket.handshake.auth?.token;

        if (!token) {
            return next(new Error('Unauthorized - Token not found'));
        }

        // verify token
        const decoded = jwt.verify(token, ENV.JWT_SECRET);
        if(!decoded) {
            return next(new Error('Unauthorized - Invalid token'))
        }
        
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return next(new Error('Unauthorized - User not found'));
        }

        // attach user info to socket object
        socket.user = user;
        socket.userId = user._id.toString()

        next();
    } catch (error) {
        console.log("Error in socket authentication:", error.message);
        return next(new Error('Unauthorized - Internal server error'));
    }
}