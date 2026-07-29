import express from 'express'
import { checkAuth, login, logout, signup, updateProfile } from '../controllers/auth.controller.js'
import { isAuthenticated } from '../middleware/isAuthenticated.middleware.js'
const router = express.Router()


router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.put('/update-profile', isAuthenticated, updateProfile)

router.get("/check", isAuthenticated, checkAuth)


export default router