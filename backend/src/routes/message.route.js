import express from "express";
import { getAllContacts } from "../controllers/message.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
const router = express.Router()


router.get('/contacts', isAuthenticated, getAllContacts)
// router.get('/chat', getChatPartners)
// router.get('/:id', getMessagesByUserId)   // partner's id
// router.get('/send', sendMessage)

export default router