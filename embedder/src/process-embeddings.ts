import fs from 'node:fs'

export interface EmbeddingData {
  path: string
  embedding: number[]
  number: number
  split: 'test' | 'train'
  class: 'cat' | 'dog'
}

const files = fs.readdirSync('./embeddings').map((f) => `../embeddings/${f}`)
let embeddings: EmbeddingData[] = []

for (const file of files) {
  const json = JSON.parse(fs.readFileSync(file).toString())
  embeddings = embeddings.concat(json)
}

for (const embedding of embeddings) {
  embedding.number = parseInt(String(/\d+/.exec(embedding.path)), 10)
  embedding.split = embedding.number < 500 ? 'test' : 'train'
  embedding.class = embedding.path.includes('cat') ? 'cat' : 'dog'
}

fs.writeFileSync('../embeddings.json', JSON.stringify(embeddings))
