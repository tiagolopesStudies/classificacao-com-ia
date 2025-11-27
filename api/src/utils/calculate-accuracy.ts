interface PredictedData {
  predictedClass: string
  trueClass: string
}

export function calculateAccuracy(results: PredictedData[]) {
  let nCorrect = 0

  for (const result of results) {
    if (result.predictedClass === result.trueClass) {
      nCorrect++
    }
  }

  return nCorrect / results.length
}
