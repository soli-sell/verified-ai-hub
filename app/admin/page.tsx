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
    const id = formData.get("id");
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
