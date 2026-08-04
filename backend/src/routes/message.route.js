import express from "express";
import { getAllContacts, getMessagesByUserId, sendMessage } from "../controllers/message.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
const router = express.Router()


router.get('/contacts', isAuthenticated, getAllContacts)
// router.get('/chat', getChatPartners)
router.get('/:id', isAuthenticated, getMessagesByUserId)   // partner's id
router.post('/send/:id', isAuthenticated, sendMessage)


export default router