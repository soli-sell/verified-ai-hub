"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  read_time: string;
  author: string;
  excerpt: string;
  content: string;
  published_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<Post | null>(null);

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("published_at", { ascending: false });

    if (!error && data) {
      setPosts(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();

    const channel = supabase
      .channel("public:posts")
      .on("postgres_changes", { event: "*", schema: "public", table: "posts" }, () => fetchPosts())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", color: "#0f172a", fontFamily: "sans-serif" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #bae6fd", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
              <div style={{ width: "36px", height: "36px", backgroundColor: "#0284c7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "900", fontSize: "22px", boxShadow: "0 2px 6px rgba(2, 132, 199, 0.3)" }}>
                V
              </div>
              <span style={{ fontSize: "24px", fontWeight: "900", color: "#0284c7" }}>VerifiedAIHub</span>
            </Link>
            <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "12px", fontWeight: "bold", padding: "4px 12px", borderRadius: "20px", border: "1px solid #bae6fd" }}>
              Industry Insights
            </span>
          </div>

          <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
            <Link href="/" style={{ color: "#0369a1", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
              ← Back to Directory
            </Link>
            <Link href="/submit" style={{ backgroundColor: "#0284c7", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", textDecoration: "none" }}>
              + Submit AI Tool
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 40px auto" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "12px", color: "#0f172a" }}>Healthcare AI & Compliance Insights</h1>
          <p style={{ fontSize: "16px", fontWeight: "600", color: "#0369a1", lineHeight: "1.6" }}>
            Expert analysis, regulatory updates, and real-world case studies designed for health system leaders, informatics teams, and AI founders.
          </p>
        </div>

        {/* Article Cards Grid */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", fontSize: "18px", fontWeight: "bold", color: "#0369a1" }}>
            Loading industry insights...
          </div>
        ) : posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", fontSize: "16px", color: "#64748b" }}>
            No published articles found. Add your first post in the Supabase Dashboard!
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", marginBottom: "48px" }}>
            {posts.map((article) => (
              <div
                key={article.id}
                style={{ backgroundColor: "#ffffff", border: "1px solid #e0f2fe", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: "bold", padding: "4px 10px", borderRadius: "6px" }}>
                      {article.category}
                    </span>
                    <span style={{ fontSize: "12px", color: "#64748b" }}>{article.read_time}</span>
                  </div>

                  <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px", lineHeight: "1.4" }}>
                    {article.title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "#94a3b8", marginBottom: "12px" }}>By {article.author}</p>
                  <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", marginBottom: "20px" }}>
                    {article.excerpt}
                  </p>
                </div>

                <button
                  onClick={() => setSelectedArticle(article)}
                  style={{ width: "100%", backgroundColor: "#f0f9ff", color: "#0284c7", padding: "10px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", border: "1px solid #bae6fd", cursor: "pointer" }}
                >
                  Read Article →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* ARTICLE READER MODAL */}
      {selectedArticle && (
        <div onClick={() => setSelectedArticle(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "700px", width: "100%", maxHeight: "85vh", overflowY: "auto", padding: "32px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", position: "relative" }}>
            <button onClick={() => setSelectedArticle(null)} style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", fontSize: "24px", color: "#64748b", cursor: "pointer" }}>✕</button>

            <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "12px", fontWeight: "bold", padding: "4px 10px", borderRadius: "6px" }}>
              {selectedArticle.category}
            </span>

            <h2 style={{ fontSize: "26px", fontWeight: "800", color: "#0f172a", margin: "12px 0 8px 0", lineHeight: "1.3" }}>
              {selectedArticle.title}
            </h2>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "24px" }}>
              Published by {selectedArticle.author} • {selectedArticle.read_time}
            </p>

            <div style={{ fontSize: "15px", color: "#334155", lineHeight: "1.8", whiteSpace: "pre-line", borderTop: "1px solid #e0f2fe", paddingTop: "20px" }}>
              {selectedArticle.content}
            </div>

            <div style={{ marginTop: "32px", textAlign: "right" }}>
              <button onClick={() => setSelectedArticle(null)} style={{ backgroundColor: "#0284c7", color: "#ffffff", border: "none", padding: "8px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e0f2fe", padding: "24px", marginTop: "40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div>
            <p style={{ fontWeight: "bold", margin: "0", color: "#0f172a" }}>VerifiedAIHub Insights</p>
            <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>© 2026 VerifiedAIHub. All rights reserved.</p>
          </div>
          <Link href="/" style={{ color: "#0369a1", textDecoration: "none", fontWeight: "600", fontSize: "13px" }}>
            Return to Directory →
          </Link>
        </div>
      </footer>
    </div>
  );
}
