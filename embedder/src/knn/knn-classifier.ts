import fs from 'node:fs'
import path from 'node:path'
import { cos_sim } from '@huggingface/transformers'
import { ImgEmbedder } from '@/embedding/img-embedder'
import type { EmbeddingData } from '@/embedding/process-embeddings'

interface DistanceData {
  distance: number
  class: string
}

function compare(testEmbedding: EmbeddingData) {
  const embeddingsPath = path.resolve('./embeddings.json')
  const embeddings = JSON.parse(
    fs.readFileSync(embeddingsPath).toString()
  ) as EmbeddingData[]

  const distances: DistanceData[] = []

  for (const trainEmbedding of embeddings) {
    const distance = cos_sim(testEmbedding.embedding, trainEmbedding.embedding)

    distances.push({
      distance,
      class: trainEmbedding.class ?? ''
    })
  }

  return distances
}

function getKNearestNeighbors(distances: DistanceData[], k: number) {
  const sortedDistances = distances.sort((a, b) => {
    if (a.distance > b.distance) return -1

    return 1
  })

  return sortedDistances.slice(0, k)
}

function countClasses(knn: DistanceData[]) {
  const classCount: Record<string, number> = {}

  for (const n of knn) {
    classCount[n.class] = classCount[n.class] ? classCount[n.class] + 1 : 1
  }

  return classCount
}

function getMaxClass(classCount: Record<string, number>) {
  let maxClass = ''
  let maxClassCount = 0

  for (const cls in classCount) {
    if (classCount[cls] > maxClassCount) {
      maxClassCount = classCount[cls]
      maxClass = cls
    }
  }

  return maxClass
}

function classify(testEmbedding: EmbeddingData, k: number) {
  const distances = compare(testEmbedding)
  const knn = getKNearestNeighbors(distances, k)
  const classCount = countClasses(knn)

  return getMaxClass(classCount)
}

export async function knnClassify(path: string, k: number) {
  const embeddedImage = await ImgEmbedder.embedImage(path)

  const testEmbedding: EmbeddingData = {
    path,
    embedding: embeddedImage
  }

  return classify(testEmbedding, k)
}
