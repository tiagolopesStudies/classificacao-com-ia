import fs from 'node:fs'
import { GoogleGenAI, Type } from '@google/genai'

type DogOrCat = 'dog' | 'cat'

type OutputData = {
  category: 'dog' | 'cat' | 'inconclusive'
}[]

export interface TestInstanceSchema {
  path: string
  trueClass: DogOrCat
  predictedClass?: DogOrCat
}

const genai = new GoogleGenAI({ apiKey: process.env.GEN_AI_API_KEY })

async function imageUrlToBase64(url: string): Promise<string> {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  return buffer.toString('base64')
}

async function readImage(path: string) {
  if (path.startsWith('http')) {
    const base64 = await imageUrlToBase64(path)
    return base64
  }

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
          enum: ['dog', 'cat', 'inconclusive']
        }
      }
    }
  }
}

const prompt = `
  Identifique se a imagem contém gatos ou cachorros.
  Retorne uma das seguintes categorias de acordo com o conteúdo da imagem:
  - 'cat' caso a imagem contenha um ou mais gatos;
  - 'dog' caso a imagem contenha um ou mais cachorros;
  - 'inconclusive' caso não consiga identificar nenhum cachorro ou gato na imagem.
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

export async function llmClassify(path: string) {
  const imgToBase64 = await readImage(path)
  const inlineData = transformToInlineData(imgToBase64)
  const contents = [inlineData, { text: prompt }]

  const response = await geminiGenerateContent(contents)
  const result = JSON.parse(response.text ?? '') as OutputData

  return result[0].category
}
