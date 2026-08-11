import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const params = await searchParams;
  const isSuccess = params?.success === "true";

  async function submitTool(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    let website_url = (formData.get("website_url") as string || "").trim();
    const tagline = formData.get("tagline") as string;
    const description = formData.get("description") as string;
    const sector = formData.get("sector") as string;
    const pricing_model = formData.get("pricing_model") as string;
    const contact_email = formData.get("contact_email") as string;

    // Automatically prepends https:// if user enters "claude.ai" instead of "https://claude.ai"
    if (website_url && !website_url.startsWith("http://") && !website_url.startsWith("https://")) {
      website_url = `https://${website_url}`;
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error } = await supabase.from("tool_submissions").insert([
      {
        name,
        website_url,
        tagline,
        description,
        sector,
        pricing_model,
        contact_email,
        status: "pending",
      },
    ]);

    if (error) {
      console.error("Submission DB Error:", error);
      throw new Error(error.message);
    }

    redirect("/submit?success=true");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-blue-400 tracking-tight flex items-center gap-2">
            ✨ Verified AI Hub
          </Link>
          <Link href="/" className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500">
            ← Back to Directory
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {isSuccess ? (
          <div className="bg-slate-900 p-8 border border-slate-800 rounded-2xl text-center space-y-4 shadow-xl">
            <div className="text-4xl">🎉</div>
            <h1 className="text-2xl font-bold text-white">Submission Received!</h1>
            <p className="text-slate-400 text-sm">
              Thank you for submitting your AI tool. It is now waiting in your Admin Dashboard under Pending Approvals.
            </p>
            <div className="pt-4 flex justify-center gap-4">
              <Link href="/admin" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl">
                Go to Admin Dashboard →
              </Link>
              <Link href="/submit" className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl">
                Submit Another Tool
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2 text-center mb-8">
              <h1 className="text-3xl font-extrabold text-white">Submit an AI Tool</h1>
              <p className="text-slate-400 text-sm">Add your application to the directory for review.</p>
            </div>

            <form action={submitTool} className="space-y-6 bg-slate-900 p-8 border border-slate-800 rounded-2xl shadow-xl">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Tool Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Claude AI"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Website URL *</label>
                <input
                  type="text"
                  name="website_url"
                  required
                  placeholder="claude.ai or https://claude.ai"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Contact Email *</label>
                <input
                  type="email"
                  name="contact_email"
                  required
                  placeholder="founder@example.com"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Tagline *</label>
                <input
                  type="text"
                  name="tagline"
                  required
                  placeholder="e.g. Next-generation AI assistant"
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Sector *</label>
                  <select
                    name="sector"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Developer Tools">Developer Tools</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Legal">Legal</option>
                    <option value="Education">Education</option>
                    <option value="Marketing">Marketing</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Pricing Model *</label>
                  <select
                    name="pricing_model"
                    required
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Freemium">Freemium</option>
                    <option value="Free">Free</option>
                    <option value="Paid">Paid</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-300">Description *</label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  placeholder="Describe what the tool does..."
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-blue-600/20"
              >
                Submit Tool
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}
