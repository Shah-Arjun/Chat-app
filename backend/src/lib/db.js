import  mongoose from 'mongoose'

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDB connected")
    } catch (err) {
        console.log("DB connection error", err)
        process.exit(1) // 1 status code means failure, 0 means success
    }
}

export default connectDB