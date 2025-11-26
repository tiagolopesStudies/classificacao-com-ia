import fs from 'node:fs'
import { cos_sim } from '@huggingface/transformers'
import type { EmbeddingData } from './process-embeddings.ts'

interface DistanceData {
  distance: number
  class: string
}

interface PredictedData {
  predictedClass: string
  trueClass: string
}

const embeddings = JSON.parse(
  fs.readFileSync('../embeddings.json').toString()
) as EmbeddingData[]

const trainEmbeddings = embeddings.filter((e) => e.split === 'train')
const testEmbeddings = embeddings.filter((e) => e.split === 'test')

function compare(testEmbedding: EmbeddingData) {
  const distances: DistanceData[] = []

  for (const trainEmbedding of trainEmbeddings) {
    const distance = cos_sim(testEmbedding.embedding, trainEmbedding.embedding)

    distances.push({
      distance,
      class: trainEmbedding.class
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

function calculateAccuracy(results: PredictedData[]) {
  let nCorrect = 0

  for (const result of results) {
    if (result.predictedClass === result.trueClass) {
      nCorrect++
    }
  }

  return nCorrect / results.length
}

const predictedClasses: PredictedData[] = []

for (const testEmbedding of testEmbeddings) {
  const predictedClass = classify(testEmbedding, 5)

  predictedClasses.push({
    predictedClass: predictedClass,
    trueClass: testEmbedding.class
  })
}

console.log(calculateAccuracy(predictedClasses))
