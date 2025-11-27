import fs from 'node:fs'
import { ImgEmbedder } from './img-embedder.js'

async function init() {
  const images = fs.readdirSync('../../data').map((f) => `../../data/${f}`)

  let startIdx = 0
  let endIdx = 0
  while (startIdx < images.length) {
    endIdx = startIdx + 500

    const imagesToEmbed = images.slice(startIdx, endIdx)
    const embeddings = await ImgEmbedder.embedImage(imagesToEmbed)
    const output = []

    for (let i = 0; i < embeddings.length; i++) {
      output.push({
        path: images[i + startIdx],
        embedding: embeddings[i]
      })
    }

    fs.writeFileSync(
      `../../embeddings/embedding_${startIdx}.json`,
      JSON.stringify(output)
    )

    startIdx = endIdx
  }
}

init().then(() => console.log('Finished!'))
