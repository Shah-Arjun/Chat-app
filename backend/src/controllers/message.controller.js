import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";


export const getAllContacts = async (req, res) => {
    try {
        const loggedUserId = req.user.id
        const filteredUsers = await User.find({_id: { $ne: loggedUserId } }).select("-password")  // fetch all user except the logged in user(me) in contacts list

        res.status(200).json(filteredUsers );
    } catch (error) {
        console.log("Error in getAllContacts", error)
        res.status(500).json({ message: 'Error fetching contacts', error });
    }
}



export const getMessagesByUserId = async (req, res) => {
    try {
        const myId = req.user.id
        const partnerId = req.params.id

        const messages = await Message.find({
            $or: [
                {senderId: myId, receiverId: partnerId},
                {senderId: partnerId, receiverId: myId}
            ]
        })

        return res.status(200).json(messages)
    } catch (error) {
        console.log("Error in getMessagesByUserId", error)
        res.status(500).json({ message: 'Error fetching messages', error });
    }
}




export const sendMessage = async(req, res) => {
    try {
        const { text, image } = req.body
        const senderId = req.user._id
        const receiverId = req.params.id

        let imageUrl
        if(image) {
            // upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image)
            imageUrl = uploadResponse.secure_url
        }

        // create  and save the message in the database
        const newMessage = await Message.create({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        // send the message to the receiver if they are online
        const receiverSocketId = getReceiverSocketId(receiverId)
        if(receiverSocketId) {     // this checks if the user is online or not,  send the message to that receiver if online
            io.to(receiverSocketId).emit("newMessage", newMessage)
        }

        res.status(201).json(newMessage)   // send saved messages back to receiver, so that it can be displayed in the chat window
    } catch (error) {
        console.log("Error in sendMessage", error)
        res.status(500).json({ message: 'Error sending message', error });
    }
}





export const getChatPartners = async (req, res) => {
    try {
        const loggedUserId = req.user.id
        const messages = await Message.find({
            $or: [
                {senderId: loggedUserId},
                {receiverId: loggedUserId}
            ]
        })

        // fetch the id of the chat partners from the messages, and remove duplicates using Set
        const chatPartnersIds =[...new Set(messages.map((msg) => 
            msg.senderId.toString() === loggedUserId.toString() ? msg.receiverId.toString() : msg.senderId.toString()
        ))]

        // fetch the chat partners' details from the User model using the chatPartnersIds
        const chatPartners = await User.find({_id: { $in: chatPartnersIds }}).select("-password")

        res.status(200).json(chatPartners)
    } catch (error) {
        console.log("Error in getChatPartners", error)
        res.status(500).json({ message: 'Error fetching chat partners', error });
    }
}


export const deleteMyMessage =async(req, res) => {
    try {
        const msgIds = req.body.messageIds
        const userId = req.user.id

        // delete the messages from the database where the user is either the sender or receiver
        if (!Array.isArray(msgIds) || msgIds.length === 0) {
            return res.status(400).json({
                message: "Message IDs are required",
            });
        }

        const result = await Message.deleteMany({
            _id: { $in: msgIds },
            $or: [
                { senderId: userId },
                { receiverId: userId },
            ],
        });

        res.status(200).json({
            message: "Messages deleted successfully",
            deletedCount: result.deletedCount,
            msgIds: msgIds,
    });
    } catch (error) {
        console.log("Error deleting message", error)
        res.status(500).json({ message: 'Error deleting message', error });
    }
}