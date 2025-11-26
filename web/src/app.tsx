import { useState } from 'react'

export function App() {
  const [imagePath, setImagePath] = useState('')

  return (
    <div className="p-8 flex flex-col items-center gap-6">
      <h1 className="text-4xl font-semibold">Cat or Dog?</h1>

      <div className="flex flex-col items-center gap-4 w-96">
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
            className="cursor-pointer px-2 py-1 bg-blue-600 hover:bg-blue-500 transition-all rounded-md"
          >
            Classify
          </button>
        </div>

        {imagePath.trim().length > 0 ? (
          <img
            src={imagePath.trim()}
            alt="A scene with a cat or a dog"
            className="w-full h-[200px] object-cover rounded-md"
          />
        ) : (
          <div className="w-full h-[200px] border border-gray-400 rounded-md" />
        )}

        <span>Caption</span>
      </div>
    </div>
  )
}
