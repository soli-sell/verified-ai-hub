'use client'

import { useState } from 'react'

export default function AdminPage() {
  const [pin, setPin] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Form State
  const [name, setName] = useState('')
  const [category, setCategory] = useState('Healthcare')
  const [url, setUrl] = useState('')
  const [pricing, setPricing] = useState('Freemium')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (pin === '1234') {
      setIsAuthenticated(true)
    } else {
      alert('Incorrect PIN')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Ensure URL has https:// prefix
    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`
    }

    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          category, 
          url: finalUrl, 
          pricing, 
          description 
        })
      })

      const result = await res.json()

      if (!res.ok) {
        alert(`Database Error: ${result.error}`)
        setLoading(false)
        return
      }

      alert('Tool added successfully!')
      setName('')
      setUrl('')
      setDescription('')
    } catch (err) {
      alert('Failed to connect to backend server.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-4">
        <form onSubmit={handleLogin} className="bg-slate-800 p-6 rounded-xl space-y-4 max-w-sm w-full">
          <h1 className="text-xl font-bold text-center">Admin Verification</h1>
          <input
            type="password"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white focus:outline-none"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-2 rounded font-semibold">
            Unlock Admin
          </button>
        </form>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Add New AI Tool</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-800 p-6 rounded-xl border border-slate-700">
        <div>
          <label className="block text-sm mb-1 font-medium">Tool Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white focus:outline-none"
            placeholder="e.g. Claude 3.5 Sonnet"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium font-semibold">Category</label>
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white focus:outline-none"
            placeholder="e.g. Healthcare, Productivity, Coding"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Website URL</label>
          <input
            type="text"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white focus:outline-none"
            placeholder="claude.ai or https://claude.ai"
          />
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Pricing Model</label>
          <select
            value={pricing}
            onChange={(e) => setPricing(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white focus:outline-none"
          >
            <option value="Free">Free</option>
            <option value="Freemium">Freemium</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        <div>
          <label className="block text-sm mb-1 font-medium">Description</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 bg-slate-700 rounded border border-slate-600 text-white focus:outline-none"
            placeholder="Short overview of the tool..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-500 py-3 rounded font-bold text-lg disabled:opacity-50"
        >
          {loading ? 'Adding Tool...' : 'Add Tool to Database'}
        </button>
      </form>
    </div>
  )
}