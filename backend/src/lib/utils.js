import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'


export const generateToken = (userId, res) => {
    const token = jwt.sign(
        {id: userId},
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    )
    res.cookie("token", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
        httpOnly: true,   //prevent XSS attacks
        sameSite: "strict",   //prevent CSRF attacks
        secure: process.env.NODE_ENV === "production" ? true : false        // https only in production
    })

    return token
}