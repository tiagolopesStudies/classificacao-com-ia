import fs from 'node:fs'
import { createObjectCsvWriter } from 'csv-writer'
import TSNE from 'tsne-js'

const embeddings = JSON.parse(fs.readFileSync('../embeddings.json'))
const tsneInput = []

for (const embedding of embeddings) {
  if (embedding.number >= 500 && embedding.number < 550) {
    tsneInput.push(embedding)
  }
}

const model = new TSNE({
  dim: 2,
  perplexity: 30,
  earlyExaggeration: 4.0,
  learningRate: 100.0,
  nIter: 1000,
  metric: 'euclidean'
})

model.init({
  data: tsneInput.map((i) => i.embedding),
  type: 'dense'
})

model.run()

const output = model.getOutput()
const csvOutput = []

for (let i = 0; i < tsneInput.length; i++) {
  csvOutput.push({
    class: tsneInput[i].class === 'dog' ? 'blue' : 'orange',
    x: output[i][0],
    y: output[i][1]
  })
}

const csvWriter = createObjectCsvWriter({
  path: 'tsne_output.csv',
  header: [
    { id: 'class', title: 'color' },
    { id: 'x', title: 'x' },
    { id: 'y', title: 'y' }
  ]
})

csvWriter.writeRecords(csvOutput).then(() => console.log('Finished!'))
