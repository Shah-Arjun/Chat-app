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