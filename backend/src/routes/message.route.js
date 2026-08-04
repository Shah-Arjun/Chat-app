import express from "express";
import { getAllContacts, getChatPartners, getMessagesByUserId, sendMessage } from "../controllers/message.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
const router = express.Router()


router.get('/contacts', isAuthenticated, getAllContacts)
router.get('/chats', isAuthenticated, getChatPartners)
router.get('/:id', isAuthenticated, getMessagesByUserId)   // partner's id
router.post('/send/:id', isAuthenticated, sendMessage)


export default router