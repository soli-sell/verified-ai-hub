"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  url: string;
  pricing: string;
}

export default function AdminPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [category, setCategory] = useState("Healthcare");
  const [description, setDescription] = useState("");
  const [url, setUrl] = useState("");
  const [pricing, setPricing] = useState("Free");

  // Simple Admin PIN authentication
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const ADMIN_PIN = "1234"; // 🔒 Replace with your secure passcode

  useEffect(() => {
    if (isAuthenticated) {
      fetchTools();
    }
  }, [isAuthenticated]);

  async function fetchTools() {
    setLoading(true);
    const { data, error } = await supabase
      .from("tools")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTools(data);
    }
    setLoading(false);
  }

  function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    if (pinInput === ADMIN_PIN) {
      setIsAuthenticated(true);
    } else {
      alert("Invalid Admin PIN!");
    }
  }

  function clearForm() {
    setEditingTool(null);
    setName("");
    setCategory("Healthcare");
    setDescription("");
    setUrl("");
    setPricing("Free");
  }

  function startEditing(tool: Tool) {
    setEditingTool(tool);
    setName(tool.name);
    setCategory(tool.category);
    setDescription(tool.description);
    setUrl(tool.url);
    setPricing(tool.pricing);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (editingTool) {
      const { error } = await supabase
        .from("tools")
        .update({ name, category, description, url, pricing })
        .eq("id", editingTool.id);

      if (error) alert(error.message);
      else alert("Tool updated successfully!");
    } else {
      const { error } = await supabase
        .from("tools")
        .insert([{ name, category, description, url, pricing }]);

      if (error) alert(error.message);
      else alert("Tool added successfully!");
    }

    clearForm();
    fetchTools();
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this tool?")) return;

    const { error } = await supabase.from("tools").delete().eq("id", id);

    if (error) {
      alert(error.message);
    } else {
      fetchTools();
    }
  }

  // Passcode Lock Screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <form onSubmit={handleAuth} className="bg-slate-900 p-8 rounded-xl max-w-sm w-full space-y-4 border border-slate-800">
          <h1 className="text-xl font-bold">Admin Portal</h1>
          <p className="text-sm text-slate-400">Enter Admin Passcode to access dashboard</p>
          <input
            type="password"
            placeholder="Enter PIN"
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 p-3 rounded text-white outline-none focus:border-blue-500"
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 p-3 rounded font-medium transition">
            Unlock Admin Dashboard
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <h1 className="text-2xl font-bold">Admin Directory Management</h1>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-sm bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded text-slate-300"
        >
          Lock Dashboard
        </button>
      </div>

      {/* Form */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold text-blue-400">
            {editingTool ? "✏️ Edit Tool" : "➕ Add New AI Tool"}
          </h2>
          {editingTool && (
            <button onClick={clearForm} className="text-xs text-slate-400 hover:underline">
              Cancel Editing
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Tool Name</label>
            <input
              required
              type="text"
              placeholder="e.g. AlphaFold 3"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded text-sm text-white"
            >
              <option value="Healthcare">Healthcare</option>
              <option value="Life Sciences">Life Sciences</option>
              <option value="Finance">Finance</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Website URL</label>
            <input
              required
              type="text"
              placeholder="https://..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded text-sm text-white"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Pricing Model</label>
            <input
              type="text"
              placeholder="e.g. Free / Enterprise"
              value={pricing}
              onChange={(e) => setPricing(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded text-sm text-white"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-xs text-slate-400 block mb-1">Description</label>
            <textarea
              required
              rows={3}
              placeholder="Short summary of what this tool does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 p-2.5 rounded text-sm text-white"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 font-medium px-6 py-2.5 rounded text-sm text-white transition"
            >
              {editingTool ? "Save Changes" : "Add Tool to Database"}
            </button>
          </div>
        </form>
      </div>

      {/* Directory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold">Live AI Tools ({tools.length})</h2>

        {loading ? (
          <p className="text-slate-500 text-sm">Loading tools from Supabase...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase">
                  <th className="py-3 px-2">Name</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Pricing</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tools.map((tool) => (
                  <tr key={tool.id} className="hover:bg-slate-800/50">
                    <td className="py-3 px-2 font-medium">{tool.name}</td>
                    <td className="py-3 px-2 text-slate-400">{tool.category}</td>
                    <td className="py-3 px-2 text-slate-400">{tool.pricing}</td>
                    <td className="py-3 px-2 text-right space-x-2">
                      <button
                        onClick={() => startEditing(tool)}
                        className="text-xs bg-slate-800 hover:bg-slate-700 text-blue-400 px-3 py-1.5 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(tool.id)}
                        className="text-xs bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-900/50 px-3 py-1.5 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}