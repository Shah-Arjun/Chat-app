import express from 'express'
import { login, logout, signup, updateProfile } from '../controllers/auth.controller.js'
import { isAuthenticated } from '../middleware/isAuthenticated.middleware.js'
const router = express.Router()


router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.post('/update-profile', isAuthenticated, updateProfile)


export default router