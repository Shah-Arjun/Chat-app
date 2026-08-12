import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './lib/db.js'
import cookieParser from 'cookie-parser'

//routes
import authRoutes from './routes/auth.route.js' 
import messagesRoutes from './routes/message.route.js' 
import { ENV } from './lib/env.js'
import { app, server } from './lib/socket.js'


app.use(express.json({ limit: '10mb' }))   // reqbody will be parsed as JSON, only 50KB, so made it 10MB to allow image upload
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true}))
app.use(cookieParser())   // to parse cookies from the request


app.use('/api/auth', authRoutes)
app.use('/api/messages', messagesRoutes)


const PORT = ENV.PORT || 3000
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  connectDB()
})