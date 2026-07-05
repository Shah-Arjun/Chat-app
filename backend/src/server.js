import express from 'express'
import 'dotenv/config'
const app = express()


app.get('/api/auth/signup', (req, res) => {
  res.send('Signup endpoint')
})

app.get('/api/auth/login', (req, res) => {
  res.send('Login endpoint')
})

app.get('/api/auth/logout', (req, res) => {
  res.send('Logout endpoint')
})


const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})