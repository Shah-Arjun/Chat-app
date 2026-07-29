import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema({
    //attributes- TODO
}, {
    timestamps: true
})

const Message = mongoose.model('Message', messageSchema)
export default Message;