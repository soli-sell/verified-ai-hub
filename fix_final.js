const fs = require('fs');

const code = `import { createClient } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams?: Promise<{ status?: string; error?: string }> | { status?: string; error?: string };
}) {
  const resolvedParams = await searchParams;
  const isSuccess = resolvedParams?.status === "success";
  const errorMessage = resolvedParams?.error;

  async function handleSubmit(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const website_url = formData.get("website_url") as string;
    const contact_email = formData.get("contact_email") as string;
    const tagline = formData.get("tagline") as string;
    const description = formData.get("description") as string;
    const sector = formData.get("sector") as string;
    const pricing_model = formData.get("pricing_model") as string;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      redirect("/submit?error=Missing+Supabase+Environment+Variables");
    }

    let dbSuccess = false;
    let dbErrorMessage = "";

    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await supabase.from("tool_submissions").insert([
        {
          name,
          website_url,
          contact_email,
          tagline,
          description,
          sector,
          pricing_model,
        },
      ]);

      if (error) {
        dbErrorMessage = error.message;
      } else {
        dbSuccess = true;
      }
    } catch (err: any) {
      dbErrorMessage = err?.message || "Failed to save submission";
    }

    if (dbSuccess) {
      redirect("/submit?status=success");
    } else {
      redirect("/submit?error=" + encodeURIComponent(dbErrorMessage));
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
        <h2 className="text-3xl font-bold text-white">Submission Received!</h2>
        <p className="text-slate-300">
          Thank you for submitting your AI tool. Our team will review the details before publishing it to Verified AI Hub.
        </p>
        <a
          href="/submit"
          className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition-colors"
        >
          Submit Another Tool
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-12 p-8 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Submit an Enterprise AI Tool</h1>
        <p className="text-slate-400 text-sm mt-1">Apply to get listed in the Verified AI Hub directory.</p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-xl bg-red-950/80 border border-red-800/80 text-red-300 text-sm font-medium">
          ⚠️ {errorMessage}
        </div>
      )}

      <form action={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tool Name *</label>
          <input
            required
            name="name"
            type="text"
            placeholder="e.g. HealthAI"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Website URL *</label>
            <input
              required
              name="website_url"
              type="text"
              placeholder="https://example.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Contact Email *</label>
            <input
              required
              name="contact_email"
              type="email"
              placeholder="vendor@company.com"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline</label>
          <input
            name="tagline"
            type="text"
            placeholder="Short 1-sentence value proposition"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
          <textarea
            name="description"
            rows={3}
            placeholder="Detailed overview of capabilities and compliance features"
            className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Sector</label>
            <select
              name="sector"
              defaultValue="Healthcare"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Healthcare">Healthcare</option>
              <option value="Life Sciences">Life Sciences</option>
              <option value="Finance">Finance</option>
              <option value="Legal">Legal</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Pricing Model</label>
            <input
              name="pricing_model"
              type="text"
              defaultValue="Enterprise"
              placeholder="e.g. Enterprise / Subscription"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 mt-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-colors cursor-pointer"
        >
          Submit AI Tool for Review
        </button>
      </form>
    </div>
  );
}
`;

fs.writeFileSync('app/submit/page.tsx', code);
console.log('Successfully written page.tsx with proper redirect placement!');
