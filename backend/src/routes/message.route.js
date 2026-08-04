import express from "express";
import { getAllContacts, getChatPartners, getMessagesByUserId, sendMessage } from "../controllers/message.controller.js";
import { isAuthenticated } from "../middleware/isAuthenticated.middleware.js";
import { arcjetPotection } from "../middleware/arcjet.middleware.js";
const router = express.Router()

router.use(arcjetPotection, isAuthenticated)

router.get('/contacts', getAllContacts)
router.get('/chats', getChatPartners)
router.get('/:id', getMessagesByUserId)   // partner's id
router.post('/send/:id', sendMessage)


export default router