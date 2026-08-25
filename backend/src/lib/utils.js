import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { ENV } from './env.js'


export const generateToken = (userId, res) => {
    const JWT_SECRET = ENV.JWT_SECRET
    if(!JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined in environment variables")
    }
    const token = jwt.sign({id: userId}, JWT_SECRET, { expiresIn: '7d' })
    res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        httpOnly: true,                                //prevent XSS attacks
        sameSite: ENV.NODE_ENV === "production" ? "none" : "lax",     //prevent CSRF attacks
        secure: ENV.NODE_ENV === "production" ? true : false        // https only in production
    })

    return token
}