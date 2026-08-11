import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

export const revalidate = 0;

function formatUrl(tool: any) {
  // Check common database column names for the URL
  let rawUrl = tool.website_url || tool.url || tool.link || "";

  if (!rawUrl || typeof rawUrl !== "string") return "#";
  let formatted = rawUrl.trim();

  // If the string is literally "website_url" or placeholder text, default to a working domain
  if (formatted === "website_url" || formatted === "url" || formatted.includes("website_url")) {
    return "https://claude.ai";
  }

  // Handle Markdown links e.g. [text](https://example.com)
  const markdownMatch = formatted.match(/\((https?:\/\/[^\)]+)\)/);
  if (markdownMatch && markdownMatch[1]) {
    formatted = markdownMatch[1];
  } else {
    formatted = formatted.replace(/[\[\]\(\)]/g, "");
  }

  // Handle duplicated URLs
  if (formatted.includes("http") && formatted.lastIndexOf("http") > 0) {
    formatted = formatted.substring(formatted.lastIndexOf("http"));
  }

  formatted = formatted.trim().replace(/\/+$/, "");

  if (!formatted.startsWith("http://") && !formatted.startsWith("https://")) {
    formatted = `https://${formatted}`;
  }
  return formatted;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sector?: string }>;
}) {
  const params = await searchParams;
  const query = (params?.q || "").trim().toLowerCase();
  const selectedSector = params?.sector || "";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const supabase = createClient(supabaseUrl, serviceKey);

  const { data: tools, error } = await supabase
    .from("tool_submissions")
    .select("*")
    .eq("status", "approved")
    .order("id", { ascending: false });

  const filteredTools = (tools || []).filter((tool) => {
    if (selectedSector && selectedSector !== "All") {
      if (tool.sector?.toLowerCase() !== selectedSector.toLowerCase()) {
        return false;
      }
    }
    if (query) {
      return (
        tool.name?.toLowerCase().includes(query) ||
        tool.tagline?.toLowerCase().includes(query) ||
        tool.description?.toLowerCase().includes(query) ||
        tool.sector?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const sectors = ["General AI", "Developer Tools", "Healthcare", "Finance", "Legal", "Education", "Marketing"];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-extrabold text-blue-400 tracking-tight flex items-center gap-2">
            ✨ Verified AI Hub
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-300 transition-colors"
            >
              Admin
            </Link>
            <Link
              href="/submit"
              className="text-xs font-semibold px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
            >
              + Submit Tool
            </Link>
          </div>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center space-y-4">
        <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight">
          Discover Verified AI Tools
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto">
          Hand-picked, tested, and approved artificial intelligence applications across industry sectors.
        </p>

        <form method="GET" className="pt-6 max-w-2xl mx-auto flex gap-2">
          <input
            type="text"
            name="q"
            defaultValue={params?.q || ""}
            placeholder="Search AI tools by name, description, or keyword..."
            className="flex-1 px-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </section>

      <main className="max-w-7xl mx-auto px-6 pb-24">
        <div className="flex flex-wrap gap-2 mb-8 justify-center items-center text-xs">
          <Link
            href="/"
            className={`px-3 py-1.5 rounded-full border transition-colors ${
              !selectedSector
                ? "bg-blue-600 border-blue-500 text-white font-bold"
                : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
            }`}
          >
            All Tools
          </Link>

          {sectors.map((sec) => (
            <Link
              key={sec}
              href={`/?sector=${encodeURIComponent(sec)}`}
              className={`px-3 py-1.5 rounded-full border transition-colors ${
                selectedSector === sec
                  ? "bg-blue-600 border-blue-500 text-white font-bold"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700"
              }`}
            >
              {sec}
            </Link>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-950/50 border border-red-800 text-red-200 rounded-xl text-center text-sm mb-8">
            Database Fetch Error: {error.message}
          </div>
        )}

        {filteredTools.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 border border-slate-800/80 rounded-2xl max-w-xl mx-auto space-y-4">
            <p className="text-slate-400 text-lg">No approved AI tools found matching your criteria.</p>
            <p className="text-sm text-slate-500">
              Submit a tool or click <strong className="text-slate-300">Approve</strong> on pending submissions in your Admin Dashboard!
            </p>
            <div className="pt-2">
              <Link href="/admin" className="text-sm text-blue-400 hover:underline">
                Go to Admin Dashboard →
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                className="p-6 bg-slate-900 border border-slate-800/80 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-all hover:shadow-xl hover:shadow-blue-950/20"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xl font-bold text-white tracking-tight">{tool.name}</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300">
                      {tool.pricing_model || "Free"}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-blue-400">{tool.tagline}</p>

                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-slate-800/60 flex items-center justify-between">
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-950 border border-slate-800 text-slate-400">
                    {tool.sector}
                  </span>

                  <a
                    href={formatUrl(tool)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 shadow-md shadow-blue-600/20"
                  >
                    Visit Site ↗
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
