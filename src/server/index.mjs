import 'dotenv/config'
import express from 'express'

const app = express()
const port = 3001

app.use(express.json({ limit: '20kb' }))

app.get('/api/health', (request, response) => {
  response.json({
    status: 'ok',
    message: 'MoodTrip backend is running!',
  })
})

app.listen(port, '127.0.0.1', () => {
  console.log(`MoodTrip backend: http://localhost:${port}`)
})