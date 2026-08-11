const fs = require('fs');
fs.mkdirSync('app/admin', { recursive: true });

const code = `import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";

export default async function AdminDashboard() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || ""
  );

  const { data: submissions, error } = await supabase
    .from("tool_submissions")
    .select("*")
    .eq("status", "pending")
    .order("id", { ascending: false });

  async function approveTool(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await adminSupabase.from("tool_submissions").update({ status: "approved" }).eq("id", id);
    revalidatePath("/admin");
  }

  async function rejectTool(formData: FormData) {
    "use server";
    const id = formData.get("id");
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    await adminSupabase.from("tool_submissions").update({ status: "rejected" }).eq("id", id);
    revalidatePath("/admin");
  }

  return (
    <div className="max-w-5xl mx-auto my-12 p-8">
      <h1 className="text-3xl font-bold text-white mb-8">Admin Dashboard: Pending Approvals</h1>

      {error && <p className="text-red-500 mb-4">Database Error: {error.message}</p>}

      {!submissions || submissions.length === 0 ? (
        <div className="p-8 text-center bg-slate-900 rounded-xl border border-slate-800 text-slate-400">
          No pending submissions to review. You are all caught up!
        </div>
      ) : (
        <div className="space-y-6">
          {submissions.map((tool) => (
            <div key={tool.id} className="p-6 bg-slate-900 rounded-xl border border-slate-800 flex flex-col md:flex-row justify-between gap-6">
              <div className="space-y-2 flex-1">
                <h2 className="text-xl font-bold text-white">{tool.name}</h2>
                <a href={tool.website_url} target="_blank" rel="noreferrer" className="text-sm text-blue-400 hover:underline">
                  {tool.website_url}
                </a>
                <p className="text-slate-300 text-sm font-medium">{tool.tagline}</p>
                <div className="text-xs text-slate-500 mt-4 space-y-1 bg-slate-950 p-4 rounded-lg">
                  <p><strong>Sector:</strong> {tool.sector} | <strong>Pricing:</strong> {tool.pricing_model}</p>
                  <p><strong>Contact:</strong> {tool.contact_email}</p>
                  <p className="mt-2 text-slate-400">{tool.description}</p>
                </div>
              </div>

              <div className="flex md:flex-col gap-3 justify-center min-w-[120px]">
                <form action={approveTool}>
                  <input type="hidden" name="id" value={tool.id} />
                  <button className="w-full px-6 py-2.5 bg-green-600 hover:bg-green-500 text-white font-semibold rounded-lg transition-colors cursor-pointer">
                    Approve
                  </button>
                </form>
                <form action={rejectTool}>
                  <input type="hidden" name="id" value={tool.id} />
                  <button className="w-full px-6 py-2.5 bg-red-950 hover:bg-red-900 border border-red-800 text-red-200 font-semibold rounded-lg transition-colors cursor-pointer">
                    Reject
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('app/admin/page.tsx', code);
console.log('Successfully created app/admin/page.tsx');
