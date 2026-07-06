import express from 'express'
import 'dotenv/config'

//routes
import authRoutes from './routes/auth.route.js' 

const app = express()


app.use('/api/auth', authRoutes)


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})