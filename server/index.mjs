import app from './app.mjs'

const port = Number(process.env.PORT || 3001)

app.listen(port, '127.0.0.1', () => {
  console.log(`MoodTrip backend: http://localhost:${port}`)
})
