import { useState } from 'react'
import { classifyImage } from './http/classify-image'

type MethodOption = 'knn' | 'llm'

export function App() {
  const [imagePath, setImagePath] = useState('')
  const [caption, setCaption] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [method, setMethod] = useState<MethodOption>('knn')

  async function handleClick() {
    setIsLoading(true)
    const category = await classifyImage({ path: imagePath, method })

    setCaption(`It's a ${category}`)
    setIsLoading(false)
  }

  return (
    <div className="py-8 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-semibold">Cat or Dog?</h1>

      <div className="flex flex-col items-center gap-4 w-96 sm:w-[480px]">
        <div className="w-full flex gap-2">
          <input
            type="text"
            placeholder="Image path"
            value={imagePath}
            onChange={(e) => setImagePath(e.target.value)}
            className="flex-1 rounded-md p-1 border border-gray-400"
          />

          <button
            type="button"
            className="cursor-pointer px-2 py-1 bg-blue-600 hover:bg-blue-500 transition-all rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleClick}
            disabled={imagePath.trim().length === 0 || isLoading}
          >
            Classify
          </button>
        </div>

        <fieldset className="flex gap-2 border border-gray-400 py-2 px-8">
          <legend>Classify method:</legend>

          <div>
            <input
              type="radio"
              id="llm"
              name="method"
              value="llm"
              checked={method === 'llm'}
              onChange={(e) => setMethod(e.target.value as MethodOption)}
            />
            <label htmlFor="llm">LLM</label>
          </div>

          <div>
            <input
              type="radio"
              id="knn"
              name="method"
              value="knn"
              checked={method === 'knn'}
              onChange={(e) => setMethod(e.target.value as MethodOption)}
            />
            <label htmlFor="knn">KNN</label>
          </div>
        </fieldset>

        {imagePath.trim().length > 0 ? (
          <img
            src={imagePath.trim()}
            alt="A scene with a cat or a dog"
            className="w-full h-[200px] sm:h-[280px] object-cover border border-gray-400 rounded-md"
            draggable={false}
          />
        ) : (
          <div className="w-full h-[200px] sm:h-[280px] border border-gray-400 rounded-md flex justify-center items-center text-xl">
            Dog or cat image
          </div>
        )}

        <span>{caption}</span>
      </div>
    </div>
  )
}
