import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const revalidate = 0;

export default async function AdminPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, serviceKey);

  // Fetch all pending submissions
  const { data: pendingTools, error } = await supabase
    .from("tool_submissions")
    .select("*")
    .eq("status", "pending")
    .order("id", { ascending: false });

  // Server Action to approve a tool
  async function approveTool(formData: FormData) {
    "use server";
    const id = formData.get("id");
    if (!id) return;

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const client = createClient(sbUrl, sbKey);

    await client
      .from("tool_submissions")
      .update({ status: "approved" })
      .eq("id", id);

    revalidatePath("/");
    revalidatePath("/admin");
  }


  // Server Action to reject/delete a tool
  async function rejectTool(formData: FormData) {
    "use server";
    const id = formData.get("id");"use client";

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
  const ADMIN_PIN = "1234"; // 🔒 CHANGE THIS to your secret passcode!

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
      // UPDATE EXISTING TOOL
      const { error } = await supabase
        .from("tools")
        .update({ name, category, description, url, pricing })
        .eq("id", editingTool.id);

      if (error) alert(error.message);
      else alert("Tool updated successfully!");
    } else {
      // ADD NEW TOOL
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

  // Lock Screen
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

      {/* Add / Edit Form */}
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
              type="url"
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

      {/* Directory Management Table */}
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

    if (!id) return;

    const sbUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const sbKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const client = createClient(sbUrl, sbKey);

    await client
      .from("tool_submissions")
      .delete()
      .eq("id", id);

    revalidatePath("/");
    revalidatePath("/admin");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white">✨ Verified AI Hub Admin</h1>
            <p className="text-xs text-slate-400 mt-1">Review user-submitted AI tools before publishing.</p>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900 text-slate-300"
          >
            ← Back to Public Directory
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-red-950 border border-red-800 text-red-200 rounded-xl text-sm">
            Error fetching pending submissions: {error.message}
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-white mb-4">Pending Approvals ({pendingTools?.length || 0})</h2>

          {!pendingTools || pendingTools.length === 0 ? (
            <div className="p-8 bg-slate-900 border border-slate-800 rounded-2xl text-center text-slate-400 space-y-2">
              <p>No pending submissions to review. You are all caught up!</p>
              <Link href="/submit" className="text-xs text-blue-400 hover:underline inline-block">
                + Submit a test tool to review →
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {pendingTools.map((tool) => (
                <div
                  key={tool.id}
                  className="p-6 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1 max-w-2xl">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{tool.name}</h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-800 rounded text-slate-300 border border-slate-700">
                        {tool.pricing_model || "Free"}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-blue-950 text-blue-300 rounded border border-blue-800">
                        {tool.sector}
                      </span>
                    </div>
                    <p className="text-xs text-blue-400 font-medium">{tool.tagline}</p>
                    <p className="text-xs text-slate-400">{tool.description}</p>
                    <div className="text-[11px] text-slate-500 pt-1 flex gap-4">
                      <span>URL: <strong className="text-slate-300">{tool.website_url}</strong></span>
                      <span>Contact: <strong className="text-slate-300">{tool.contact_email}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <form action={approveTool}>
                      <input type="hidden" name="id" value={tool.id} />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition-colors shadow-lg shadow-emerald-600/20"
                      >
                        ✓ Approve
                      </button>
                    </form>

                    <form action={rejectTool}>
                      <input type="hidden" name="id" value={tool.id} />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-800 font-bold text-xs rounded-xl transition-colors"
                      >
                        ✕ Reject
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
