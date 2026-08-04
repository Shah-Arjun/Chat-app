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

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl
        })

        // TODO: Emit the message to the receiver using socket.io in real-time

        await newMessage.save()
        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error in sendMessage", error)
        res.status(500).json({ message: 'Error sending message', error });
    }
}