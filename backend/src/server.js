import express from 'express'
import 'dotenv/config'

//routes
import authRoutes from './routes/auth.route.js' 
import messagesRoutes from './routes/messages.route.js' 

const app = express()


app.use('/api/auth', authRoutes)
app.use('/api/messages', messagesRoutes)


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})