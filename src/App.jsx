import { useState, useEffect } from 'react'

const API = '/api/todos'

export default function App() {
  const [todos, setTodos] = useState([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('all') // all | active | completed

  useEffect(() => {
    fetch(API)
      .then((r) => r.json())
      .then(setTodos)
  }, [])

  async function addTodo(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    const res = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, completed: false }),
    })
    const created = await res.json()
    setTodos((prev) => [...prev, created])
    setInput('')
  }

  async function toggleTodo(todo) {
    const res = await fetch(`${API}/${todo.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ completed: !todo.completed }),
    })
    const updated = await res.json()
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)))
  }

  async function deleteTodo(id) {
    await fetch(`${API}/${id}`, { method: 'DELETE' })
    setTodos((prev) => prev.filter((t) => t.id !== id))
  }

  const filtered = todos.filter((t) => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  const remaining = todos.filter((t) => !t.completed).length

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-4xl font-bold text-center text-indigo-600 mb-8 tracking-tight">
          todos
        </h1>

        {/* Input */}
        <form onSubmit={addTodo} className="flex gap-2 mb-4">
          <input
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="What needs to be done?"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Add
          </button>
        </form>

        {/* List */}
        <div className="bg-white rounded-xl shadow divide-y divide-gray-100">
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">Nothing here yet.</p>
          )}
          {filtered.map((todo) => (
            <div key={todo.id} className="flex items-center gap-3 px-4 py-3 group">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo)}
                className="w-5 h-5 accent-indigo-600 cursor-pointer flex-shrink-0"
              />
              <span
                className={`flex-1 text-sm ${
                  todo.completed ? 'line-through text-gray-400' : 'text-gray-700'
                }`}
              >
                {todo.text}
              </span>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="text-gray-300 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 text-lg leading-none"
                aria-label="Delete"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Footer */}
        {todos.length > 0 && (
          <div className="flex items-center justify-between mt-3 px-1 text-xs text-gray-500">
            <span>{remaining} item{remaining !== 1 ? 's' : ''} left</span>
            <div className="flex gap-2">
              {['all', 'active', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`capitalize px-2 py-1 rounded border transition-colors ${
                    filter === f
                      ? 'border-indigo-400 text-indigo-600'
                      : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
            <button
              onClick={() => todos.filter((t) => t.completed).forEach((t) => deleteTodo(t.id))}
              className="hover:text-red-400 transition-colors"
            >
              Clear completed
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
