import fs from 'node:fs'
import { GoogleGenAI, Type } from '@google/genai'
import { config } from 'dotenv'
import type { EmbeddingData } from './process-embeddings.ts'

config({ path: '../.env', quiet: true })

type DogOrCat = 'dog' | 'cat'

type OutputData = {
  category: DogOrCat
}[]

interface TestInstanceSchema {
  path: string
  trueClass: DogOrCat
  predictedClass?: DogOrCat
}

const genai = new GoogleGenAI({ apiKey: process.env.GEN_AI_API_KEY })

const embeddings = JSON.parse(
  fs.readFileSync('../embeddings.json').toString()
) as EmbeddingData[]

const testInstances = embeddings
  .filter((e) => e.split === 'test')
  .map(
    (e) =>
      ({
        path: `../data/${e.path.slice(2)}`,
        trueClass: e.class
      }) as TestInstanceSchema
  )

function readImage(path: string) {
  return fs.readFileSync(path, { encoding: 'base64' })
}

function transformToInlineData(imgBase64: string) {
  return {
    inlineData: {
      mimeType: 'image/jpeg',
      data: imgBase64
    }
  }
}

const outputConfig = {
  responseMimeType: 'application/json',
  responseSchema: {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        category: {
          type: Type.STRING,
          enum: ['dog', 'cat']
        }
      }
    }
  }
}

const prompt = `
  Identifique se a imagem contém gatos ou cachorros.
  Retorne uma das seguintes categorias de acordo com o conteúdo da imagem:
  - 'cat' caso a imagem contenha um ou mais gatos;
  - 'dog' caso a imagem contenha um ou mais cachorros.
`

// biome-ignore lint/suspicious/noExplicitAny: example
async function geminiGenerateContent(contents: any[]) {
  const response = await genai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents,
    config: outputConfig
  })

  return response
}

async function llmClassifier(path: string) {
  const imgToBase64 = readImage(path)
  const inlineData = transformToInlineData(imgToBase64)
  const contents = [inlineData, { text: prompt }]

  const response = await geminiGenerateContent(contents)
  const result = JSON.parse(response.text ?? '') as OutputData

  return result[0].category
}

const requests = testInstances
  .slice(0, 10)
  .map((item) => llmClassifier(item.path))

Promise.all(requests).then((results) => {
  results.forEach((result, i) => {
    testInstances[i].predictedClass = result
  })
})
