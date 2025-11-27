import { api } from '../lib/axios'

interface ClassifyImageBodyParams {
  path: string
  method?: 'llm' | 'knn'
  k?: number
}

interface Output {
  category: 'cat' | 'dog' | 'inconclusive'
}

export async function classifyImage(body: ClassifyImageBodyParams) {
  const result = await api.post<Output>('/classify', body)

  return result.data.category
}
