/** biome-ignore-all lint/suspicious/noExplicitAny: example */
import fs from 'node:fs'
import { pipeline } from '@huggingface/transformers'

async function init() {
  const imgEmbedder = await pipeline(
    'image-feature-extraction',
    'Xenova/clip-vit-base-patch32',
    { dtype: 'fp32' }
  )

  async function embedImage(images: string | string[]) {
    const result = await imgEmbedder(images, {
      pooling: 'cls',
      normalize: true
    } as any)
    return result.tolist()
  }

  const images = fs.readdirSync('../../data').map((f) => `../../data/${f}`)

  let startIdx = 0
  let endIdx = 0
  while (startIdx < images.length) {
    endIdx = startIdx + 500

    const imagesToEmbed = images.slice(startIdx, endIdx)
    const embeddings = await embedImage(imagesToEmbed)
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
