import { sendWelcomeEmail } from '../email/emailHandlers.js'
import { ENV } from '../lib/env.js'
import { generateToken } from '../lib/utils.js'
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'



export const signup = async(req, res) => {
    try {
        const {fullName, email, password} = req.body

        if(!fullName || !email || ! password) {
            return res.status(400).json({ message: "All fields are required" })
        }

        if(password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" })
        }

        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Invalid email format" })
        }

        const existingUser = await User.findOne({ email})
        if(existingUser) return res.status(400).json({ message: "Email already in use" })

        const salt = await bcrypt.genSalt(10)   // 10 --> is the lenght of generated hashed password
        const hashedPw = await bcrypt.hash(password, salt)

        const newUser = await User.create({
            fullName,
            email,
            password: hashedPw
        })

        if(newUser) {
            const savedUser = await newUser.save()
            generateToken(savedUser._id, res)
            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic
            })

            try {
                await sendWelcomeEmail(savedUser.email, savedUser.fullName, ENV.CLIENT_URL)
            } catch (error) {
                console.error("Failed to send welcome email:", error)
            }
        } else {
            res.status(400).json({ message: "Invalid user data" })
        }
    } catch (err) {
        console.error("Error during signup:", err)
        res.status(500).json({ message: "Internal server error" })
    }
}






export const login = async(req, res) => {
    const { email, password } = req.body
    try {
        if(!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            })
        }
        const userExists = await User.findOne({ email })
        if(!userExists) {
            return res.status(400).json({
                message: "Invalid email or password. User not found"
            })
        }
        const isMatch = await bcrypt.compare(password, userExists.password)
        if(!isMatch) {
            return res.status(400).json({
                message: "Invalid email or password"
            })
        }
        generateToken(userExists._id, res)
        return res.status(200).json({
            _id: userExists._id,
            fullName: userExists.fullName,
            email: userExists.email,
            profilePic: userExists.profilePic
        })
    } catch (err) {
        console.log("Login error", err)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}



export const logout = async(_, res) => {
    try {
        // res.clearCookie('token', {
        //     httpOnly: true,
        //     secure: ENV.NODE_ENV === 'production'
        // })

        // OR

        res.cookie("token", "", {maxAge: 0})
        res.status(200).json({ message: "Logged out successfully" })
    } catch (err) {
        console.error("Error during logout:", err)
        res.status(500).json({ message: "Internal server error" })
    }
}




export const updateProfile = async(req, res) => {
    try {
        const { profilePic } = req.body
        const userId = req.user._id

        if(!profilePic) {
            return res.status(400).json({
                message: "Profile picture is required"
            })
        }

        const uploadRes = await cloudinary.uploader.upload(profilePic, {
            folder: 'chat_app_profile_pics',
        })
        const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadRes.secure_url }, { new: true })

        return res.status(200).json({
            message: "Profile updated successfully",
            user: updatedUser
        })
    }catch (err) {
        console.log("Update user error", err)
        return res.status(500).json({
            message: "Internal server error"
        })
    }
}



export const checkAuth = (req, res) => {
    try {
        res.status(200).json(req.user)
    } catch (error) {
        console.log("Error in checkAuth controller", error.message)
        res.status(500).json({ message: "Internal server error"})
    }
} 