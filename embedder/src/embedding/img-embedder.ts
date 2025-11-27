/** biome-ignore-all lint/suspicious/noExplicitAny: example */
import {
  type ImageFeatureExtractionPipeline,
  type PipelineType,
  type PretrainedModelOptions,
  pipeline
} from '@huggingface/transformers'

export class ImgEmbedder {
  static task: PipelineType = 'image-feature-extraction'
  static model = 'Xenova/clip-vit-base-patch32'
  static options: PretrainedModelOptions = { dtype: 'fp32' }
  static pipeline?: ImageFeatureExtractionPipeline

  static async getPipeline() {
    if (!ImgEmbedder.pipeline) {
      ImgEmbedder.pipeline = (await pipeline(
        ImgEmbedder.task,
        ImgEmbedder.model,
        ImgEmbedder.options
      )) as ImageFeatureExtractionPipeline
    }

    return ImgEmbedder.pipeline
  }

  static async embedImage(images: string | string[]) {
    const pipeline = await ImgEmbedder.getPipeline()
    const result = await pipeline(images, {
      pooling: 'cls',
      normalize: true
    } as any)
    return result.tolist()
  }
}
