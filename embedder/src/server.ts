import express from 'express'
import z from 'zod'
import { knnClassify } from './knn/knn-classifier'
import { llmClassify } from './llm/llm-classifier'

const app = express()

app.use(express.json())

app.get('/', (_, res) => {
  res.json({
    message: 'API is Running'
  })
})

app.post('/classify', async (req, res) => {
  const classifyBodySchema = z.object({
    path: z.url(),
    method: z.enum(['knn', 'llm']).default('knn'),
    k: z.coerce.number().default(5)
  })

  const { error, data } = classifyBodySchema.safeParse(req.body)

  if (error) {
    return res.status(400).json({
      errors: error.issues
    })
  }

  const { path, method, k } = data

  try {
    let category: string
    if (method === 'knn') {
      category = await knnClassify(path, k)
    } else {
      category = await llmClassify(path)
    }

    return res.json({
      category
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      error: 'Erro interno no servidor'
    })
  }
})

app.listen(3000, () => {
  console.log('API is running at port 3000')
})
