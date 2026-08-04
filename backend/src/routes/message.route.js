import express from "express";
import { getAllContacts, getMessagesByUserId } from "../controllers/message.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
const router = express.Router()


router.get('/contacts', isAuthenticated, getAllContacts)
// router.get('/chat', getChatPartners)
router.get('/:id', isAuthenticated, getMessagesByUserId)   // partner's id
// router.get('/send', sendMessage)

export default router