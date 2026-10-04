"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function Home() {
  const [tools, setTools] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCompliance, setSelectedCompliance] = useState("All Standards");
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [activeModal, setActiveModal] = useState<"detail" | "submit" | "contact" | "claim" | null>(null);

  // Form State
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "success">("idle");
  const [contactData, setContactData] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [claimData, setClaimData] = useState({ name: "", email: "", proof: "" });
  const [claimStatus, setClaimStatus] = useState<"idle" | "submitting" | "success">("idle");

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const { data } = await supabase
      .from("tools")
      .select("*")
      .eq("status", "approved");
    if (data) setTools(data);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTool) return;
    await supabase.from("reviews").insert([
      { tool_id: selectedTool?.id, tool_name: selectedTool?.name, comment: reviewComment }
    ]);
    setReviewStatus("success");
    setReviewComment("");
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("submitting");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactData),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setContactStatus("success");
        setContactData({ name: "", email: "", message: "" });
      } else {
        setContactStatus("idle");
        alert(`Submission Error: ${data.error?.message || JSON.stringify(data.error) || "Failed to send message"}`);
      }
    } catch (err: unknown) {
      setContactStatus("idle");
      const message = err instanceof Error ? err.message : "Network error";
      alert(`Network Error: ${message}`);
    }
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaimStatus("submitting");
    await supabase.from("claims").insert([
      { tool_id: selectedTool?.id, tool_name: selectedTool?.name, name: claimData.name, email: claimData.email, proof: claimData.proof }
    ]);
    setClaimStatus("success");
    setClaimData({ name: "", email: "", proof: "" });
  };

  const filteredTools = tools.filter((tool: any) => {
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    const matchesCompliance = selectedCompliance === "All Standards" || tool.compliance === selectedCompliance;
    const matchesSearch =
      tool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesCompliance && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", fontFamily: "sans-serif" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <span style={{ fontSize: "24px", fontWeight: "900", color: "#0369a1" }}>Verified AI Hub</span>
            </Link>
            <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "4px 8px", borderRadius: "12px", fontSize: "12px", fontWeight: "bold" }}>Enterprise Standard</span>
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <button onClick={() => setActiveModal("contact")} style={{ backgroundColor: "transparent", border: "none", color: "#475569", fontWeight: "600", cursor: "pointer" }}>Connect</button>
            <Link href="/blog" style={{ color: "#475569", fontWeight: "600", textDecoration: "none" }}>Blog</Link>
            <Link href="/submit" style={{ backgroundColor: "#0284c7", color: "#ffffff", padding: "8px 16px", borderRadius: "6px", textDecoration: "none", fontWeight: "bold" }}>Submit AI Tool</Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "900", color: "#0f172a", marginBottom: "12px" }}>Verified Enterprise AI Directory</h1>
          <p style={{ fontSize: "18px", color: "#475569" }}>Discover, compare, and index artificial intelligence tools across compliance standards.</p>
        </div>

        {/* Search */}
        <div style={{ maxWidth: "600px", margin: "0 auto 24px auto" }}>
          <input
            type="text"
            placeholder="Search AI tools by name, description, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "16px" }}
          />
        </div>

        {/* Tool Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "24px" }}>
          {filteredTools.map((tool: any) => (
            <div key={tool.id} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: "20px", fontWeight: "bold", color: "#0f172a", marginBottom: "8px" }}>{tool.name}</h3>
                <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "16px" }}>{tool.description}</p>
              </div>
              <button
                onClick={() => { setSelectedTool(tool); setActiveModal("detail"); }}
                style={{ backgroundColor: "#f1f5f9", color: "#0f172a", padding: "8px 16px", borderRadius: "6px", border: "none", fontWeight: "bold", cursor: "pointer" }}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Modals */}
      {activeModal && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "12px", maxWidth: "500px", width: "90%", position: "relative" }}>
            <button onClick={() => { setActiveModal(null); setContactStatus("idle"); }} style={{ position: "absolute", top: "16px", right: "16px", border: "none", background: "none", fontSize: "20px", cursor: "pointer" }}>✕</button>

            {/* Contact Modal */}
            {activeModal === "contact" && (
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px", color: "#0f172a" }}>Connect With Us</h2>
                {contactStatus === "success" ? (
                  <div style={{ backgroundColor: "#ecfdf5", color: "#047857", padding: "16px", borderRadius: "8px", fontWeight: "bold" }}>
                    ✓ Message transmitted successfully!
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={contactData.name}
                      onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", color: "#000" }}
                    />
                    <input
                      type="email"
                      required
                      placeholder="Your Email"
                      value={contactData.email}
                      onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", color: "#000" }}
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder="Message / Feedback"
                      value={contactData.message}
                      onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                      style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc", color: "#000" }}
                    />
                    <button
                      type="submit"
                      disabled={contactStatus === "submitting"}
                      style={{ backgroundColor: "#0284c7", color: "#fff", padding: "12px", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                    >
                      {contactStatus === "submitting" ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}