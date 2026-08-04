import User from "../models/user.model.js";


export const getAllContacts = async (req, res) => {
    try {
        const loggedUserId = req.user.id
        const filteredUsers = await User.find({_id: { $ne: loggedUserId } }).select("-password")  // fetch sll user except the logged in user(me) in contacts list

        res.status(200).json(filteredUsers );
    } catch (error) {
        console.log("Error in getAllContacts", error)
        res.status(500).json({ message: 'Error fetching contacts', error });
    }
}