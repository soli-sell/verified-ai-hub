"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

export default function SubmitArticlePage() {
  const [articleData, setArticleData] = useState({
    title: "",
    category: "Case Studies",
    author: "",
    author_email: "",
    excerpt: "",
    content: ""
  });

  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const formattedSlug = articleData.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    const { error } = await supabase.from("posts").insert([
      {
        slug: formattedSlug,
        title: articleData.title,
        category: articleData.category,
        author: articleData.author,
        author_email: articleData.author_email,
        excerpt: articleData.excerpt,
        content: articleData.content,
        read_time: "5 min read",
        status: "pending"
      }
    ]);

    if (error) {
      setErrorMessage(error.message);
      setStatus("error");
    } else {
      setStatus("success");
      setArticleData({
        title: "",
        category: "Case Studies",
        author: "",
        author_email: "",
        excerpt: "",
        content: ""
      });
    }
  };

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", color: "#0f172a", fontFamily: "sans-serif" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #bae6fd", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "36px", height: "36px", backgroundColor: "#0284c7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "900", fontSize: "22px", boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)" }}>
              V
            </div>
            <span style={{ fontSize: "24px", fontWeight: "900", color: "#0284c7" }}>VerifiedAIHub</span>
          </Link>
          <Link href="/blog" style={{ color: "#0369a1", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
            ← Back to Insights Blog
          </Link>
        </div>
      </header>

      {/* Main Form Area */}
      <main style={{ maxWidth: "700px", margin: "40px auto", padding: "0 24px" }}>
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e0f2fe", borderRadius: "16px", padding: "36px", boxShadow: "0 4px 16px rgba(0,0,0,0.04)" }}>
          <h1 style={{ fontSize: "26px", fontWeight: "800", marginBottom: "8px", color: "#0f172a" }}>
            Submit Article or Clinical Case Study
          </h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "28px", lineHeight: "1.6" }}>
            Share your enterprise AI research, compliance analysis, or clinical implementation case study. All submissions undergo manual editorial review prior to publication on our main blog.
          </p>

          {status === "success" && (
            <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "16px", borderRadius: "8px", marginBottom: "24px", fontWeight: "bold", fontSize: "14px" }}>
              ✓ Article submitted successfully! Our editorial board will review your draft and contact you regarding placement.
            </div>
          )}

          {status === "error" && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "16px", borderRadius: "8px", marginBottom: "24px", fontSize: "14px" }}>
              Error: {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} autoComplete="off" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#334155" }}>
                Article or Case Study Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Reducing Physician Charting Time by 40% with Ambient Voice AI"
                value={articleData.title}
                onChange={(e) => setArticleData({ ...articleData, title: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#334155" }}>
                  Category *
                </label>
                <select
                  value={articleData.category}
                  onChange={(e) => setArticleData({ ...articleData, category: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box", backgroundColor: "#ffffff" }}
                >
                  <option value="Case Studies">Case Studies</option>
                  <option value="Compliance & Security">Compliance & Security</option>
                  <option value="Regulatory Insights">Regulatory Insights</option>
                  <option value="Product Spotlights">Product Spotlights</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#334155" }}>
                  Author Name & Credentials *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Jane Smith, CMIO"
                  value={articleData.author}
                  onChange={(e) => setArticleData({ ...articleData, author: e.target.value })}
                  style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box" }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#334155" }}>
                Contact / Corporate Email *
              </label>
              <input
                type="email"
                required
                placeholder="author@healthsystem.org"
                value={articleData.author_email}
                onChange={(e) => setArticleData({ ...articleData, author_email: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#334155" }}>
                Executive Summary / Excerpt *
              </label>
              <textarea
                required
                rows={2}
                placeholder="Provide a 2-sentence summary highlighting the key clinical outcome or regulatory finding..."
                value={articleData.excerpt}
                onChange={(e) => setArticleData({ ...articleData, excerpt: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box", fontFamily: "sans-serif" }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px", color: "#334155" }}>
                Full Article Draft *
              </label>
              <textarea
                required
                rows={10}
                placeholder="Paste the full article body or case study text here..."
                value={articleData.content}
                onChange={(e) => setArticleData({ ...articleData, content: e.target.value })}
                style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box", fontFamily: "sans-serif" }}
              />
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              style={{ backgroundColor: "#0284c7", color: "#ffffff", padding: "14px", borderRadius: "8px", border: "none", fontWeight: "bold", fontSize: "16px", cursor: "pointer", marginTop: "8px", boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)" }}
            >
              {status === "submitting" ? "Submitting Article..." : "Submit Article for Review"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
