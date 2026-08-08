import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './lib/db.js'
import cookieParser from 'cookie-parser'

//routes
import authRoutes from './routes/auth.route.js' 
import messagesRoutes from './routes/message.route.js' 
import { ENV } from './lib/env.js'

const app = express()
app.use(express.json({ limit: "10mb" }))
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true}))
app.use(cookieParser())   // to parse cookies from the request


app.use('/api/auth', authRoutes)
app.use('/api/messages', messagesRoutes)


const PORT = ENV.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  connectDB()
})