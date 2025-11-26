import express from 'express'

const app = express()

app.use(express.json())

app.get('/', (_, res) => {
  res.json({
    message: 'API is Running'
  })
})

app.listen(3000, () => {
  console.log('API is running at port 3000')
})
