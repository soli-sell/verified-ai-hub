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
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Form States
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "submitting" | "success">("idle");
  const [contactData, setContactData] = useState({ name: "", email: "", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "success">("idle");

  const complianceStandards = ["All Standards", "HIPAA", "FDA Cleared", "SOC2", "GDPR", "ISO 27001", "CLIA", "HITRUST"];
  const categories = ["All", "Healthcare", "Life Sciences", "Diagnostics", "Biotech", "Pharma", "Financial Health"];

  useEffect(() => {
    fetchTools();
  }, []);

const fetchTools = async () => {
    try {
      // 1. Fetch approved tools
      const { data: toolsData, error: toolsError } = await supabase
        .from("tools")
        .select("*")
        .eq("status", "approved");

      if (toolsError || !toolsData) {
        console.error("Error fetching tools:", toolsError);
        return;
      }

      // 2. Fetch reviews separately so schema joins never break the page
      const { data: reviewsData } = await supabase
        .from("reviews")
        .select("tool_id, rating");

      const toolsWithRatings = toolsData.map((tool: any) => {
        const toolReviews = (reviewsData || []).filter(
          (r: any) => String(r.tool_id) === String(tool.id)
        );
        const avgRating =
          toolReviews.length > 0
            ? (
                toolReviews.reduce((acc: number, r: any) => acc + (Number(r.rating) || 5), 0) /
                toolReviews.length
              ).toFixed(1)
            : null;
        return { ...tool, avgRating, reviewCount: toolReviews.length };
      });

      setTools(toolsWithRatings);
    } catch (err) {
      console.error("Unexpected error fetching tools:", err);
    }
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

  const filteredTools = tools.filter((tool: any) => {
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    const matchesCompliance = selectedCompliance === "All Standards" || (tool.compliance && tool.compliance.includes(selectedCompliance));
    const matchesSearch =
      tool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesCompliance && matchesSearch;
  });

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e5e7eb", padding: "16px 32px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", gap: "8px", textDecoration: "none" }}>
              <div style={{ width: "32px", height: "32px", backgroundColor: "#0284c7", borderRadius: "6px", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", fontSize: "18px" }}>V</div>
              <span style={{ fontSize: "24px", fontWeight: "800", color: "#0369a1" }}>VerifiedAIHub</span>
            </Link>
            <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "16px", fontSize: "12px", fontWeight: "700" }}>
              Live Listing ({tools.length || 50})
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <Link href="/blog" style={{ color: "#0369a1", fontWeight: "700", textDecoration: "none", fontSize: "15px" }}>Insights Blog</Link>
            <Link href="/submit" style={{ backgroundColor: "#0284c7", color: "#ffffff", padding: "10px 20px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "15px" }}>+ Submit AI Tool</Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1280px", margin: "0 auto", padding: "48px 24px", flex: "1" }}>
        {/* Title Block */}
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <h1 style={{ fontSize: "42px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>Verified AI Tools Directory</h1>
          <p style={{ fontSize: "18px", color: "#0369a1", fontWeight: "600", maxWidth: "700px", margin: "0 auto" }}>
            Discover, evaluate, and index artificial intelligence solutions tailored for high-compliance enterprise sectors.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: "680px", margin: "0 auto 28px auto" }}>
          <input
            type="text"
            placeholder="Search AI tools by name, description, or compliance standard (e.g. HIPAA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "14px 20px", borderRadius: "10px", border: "1px solid #cbd5e1", fontSize: "15px", backgroundColor: "#ffffff", boxShadow: "0 2px 4px rgba(0,0,0,0.02)", outline: "none" }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap", marginBottom: "24px" }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "1px solid " + (selectedCategory === cat ? "#0284c7" : "#cbd5e1"),
                backgroundColor: selectedCategory === cat ? "#0284c7" : "#ffffff",
                color: selectedCategory === cat ? "#ffffff" : "#0369a1",
                fontWeight: "700",
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Compliance Filter Standards Box */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "20px 24px", marginBottom: "40px", maxWidth: "980px", margin: "0 auto 40px auto" }}>
          <div style={{ textAlign: "center", fontSize: "12px", fontWeight: "800", color: "#64748b", letterSpacing: "1px", marginBottom: "14px" }}>
            FILTER BY COMPLIANCE STANDARD:
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
            {complianceStandards.map((std) => (
              <button
                key={std}
                onClick={() => setSelectedCompliance(std)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  border: "none",
                  backgroundColor: selectedCompliance === std ? "#0369a1" : "#f1f5f9",
                  color: selectedCompliance === std ? "#ffffff" : "#334155",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {std !== "All Standards" && <span style={{ color: selectedCompliance === std ? "#ffffff" : "#94a3b8" }}>🛡️</span>}
                {std}
              </button>
            ))}
          </div>
        </div>

        {/* AI Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
          {filteredTools.map((tool: any) => (
            <div key={tool.id} style={{ backgroundColor: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
              <div>
                {/* Badges */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px" }}>
                  <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "800" }}>
                    {tool.category || "Healthcare"}
                  </span>
<span style={{ backgroundColor: "#fef3c7", color: "#92400e", padding: "4px 10px", borderRadius: "12px", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                    ⭐ {tool.avgRating ? `${tool.avgRating} (${tool.reviewCount})` : "5.0 (New)"}
                  </span>                
                  </div>
                <h3 style={{ fontSize: "22px", fontWeight: "900", color: "#0f172a", marginBottom: "10px" }}>{tool.name}</h3>
                <p style={{ color: "#475569", fontSize: "14px", lineHeight: "1.5", marginBottom: "18px" }}>{tool.description}</p>

                {/* Compliance Badges */}
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "20px" }}>
                  {(tool.compliance || ["HIPAA", "FDA Cleared", "SOC2", "CLIA", "CE Mark"]).map((c: string, idx: number) => (
                    <span key={idx} style={{ backgroundColor: "#fef2f2", color: "#991b1b", padding: "3px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: "700", display: "flex", alignItems: "center", gap: "3px", border: "1px solid #fecaca" }}>
                      🛡️ {c}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { setSelectedTool(tool); setActiveModal("detail"); }}
                style={{ backgroundColor: "#f0f9ff", color: "#0284c7", padding: "12px", borderRadius: "10px", border: "1px solid #bae6fd", fontWeight: "800", cursor: "pointer", textAlign: "center", width: "100%", fontSize: "14px" }}
              >
                View Details & Reviews →
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e5e7eb", padding: "32px 24px", marginTop: "60px" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px 20px", marginBottom: "24px", fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
            <strong>Legal Disclaimer:</strong> VerifiedAIHub indexes publicly available business facts, product specifications, and vendor-declared compliance standards for evaluation and market research purposes under nominative fair use. Listing on this platform does not constitute an official legal audit or endorsement unless explicitly designated with a Verified Gold status. Healthcare organizations must conduct independent due diligence prior to software deployment.
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <div style={{ fontWeight: "900", color: "#0f172a", fontSize: "16px" }}>VerifiedAIHub</div>
              <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "4px" }}>© 2026 VerifiedAIHub. All rights reserved.</div>
            </div>

            <div style={{ display: "flex", gap: "24px" }}>
              <button onClick={() => setActiveModal("about")} style={{ background: "none", border: "none", color: "#0369a1", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>About Us</button>
              <button onClick={() => setActiveModal("privacy")} style={{ background: "none", border: "none", color: "#0369a1", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>Privacy Policy</button>
              <button onClick={() => setActiveModal("terms")} style={{ background: "none", border: "none", color: "#0369a1", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>Terms of Service</button>
              <button onClick={() => setActiveModal("contact")} style={{ background: "none", border: "none", color: "#0369a1", fontWeight: "700", cursor: "pointer", fontSize: "14px" }}>Contact</button>
              <Link href="/blog" style={{ color: "#0369a1", fontWeight: "700", textDecoration: "none", fontSize: "14px" }}>Blog</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}

      {/* Claim Modal */}
      {activeModal === "claim" && selectedTool && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "500px", width: "100%", padding: "32px", position: "relative", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)" }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold", fontSize: "16px", color: "#64748b" }}
            >
              ✕
            </button>
            <h3 style={{ marginTop: 0, fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>
              Claim {selectedTool.name}
            </h3>
            <p style={{ fontSize: "13px", color: "#64748b", marginBottom: "20px" }}>
              Verify ownership to claim this profile and receive a Verified Gold Badge.
            </p>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const formData = new FormData(form);
                const name = formData.get("name") as string;
                const email = formData.get("email") as string;
                const proof = formData.get("proof") as string;

                try {
                  await fetch("/api/contact", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      name,
                      email,
                      message: `CLAIM REQUEST for tool: ${selectedTool.name}\nProof Link: ${proof}`,
                    }),
                  });
                  alert("Claim request sent successfully to support@verifiedaihub.com!");
                  setActiveModal(null);
                } catch (err) {
                  alert("Failed to submit claim request. Please try again.");
                }
              }}
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              <input name="name" type="text" placeholder="Your Full Name" required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
              <input name="email" type="email" placeholder="Work Email Address" required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
              <input name="proof" type="text" placeholder="Proof Link (LinkedIn Profile or Site)" required style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }} />
              <button type="submit" style={{ backgroundColor: "#0284c7", color: "#ffffff", padding: "12px", borderRadius: "8px", fontWeight: "700", border: "none", cursor: "pointer", marginTop: "8px" }}>
                Submit Claim Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {activeModal === "detail" && selectedTool && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "16px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", padding: "32px", maxWidth: "672px", width: "100%", maxHeight: "90vh", overflowY: "auto", position: "relative", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <button
              onClick={() => {
                setActiveModal(null);
                setReviewStatus("idle");
                setReviewComment("");
              }}
              style={{ position: "absolute", top: "20px", right: "20px", border: "none", background: "#f1f5f9", width: "32px", height: "32px", borderRadius: "16px", fontSize: "16px", cursor: "pointer", color: "#475569", fontWeight: "bold" }}
            >
              ✕
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingRight: "32px", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#0088cc", backgroundColor: "#e0f2fe", padding: "4px 12px", borderRadius: "12px" }}>
                {selectedTool.sector || selectedTool.category || "Healthcare"}
              </span>
              {(selectedTool.website_url || selectedTool.websiteUrl || selectedTool.url || selectedTool.website) && (
                <a
                  href={selectedTool.website_url || selectedTool.websiteUrl || selectedTool.url || selectedTool.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ backgroundColor: "#0088cc", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "14px", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "4px" }}
                >
                  Visit Website ↗
                </a>
              )}
            </div>

            <h2 style={{ fontSize: "32px", fontWeight: "900", color: "#0f172a", margin: "8px 0 12px 0" }}>{selectedTool.name}</h2>
            <p style={{ fontSize: "15px", color: "#334155", lineHeight: "1.6", marginBottom: "24px" }}>{selectedTool.description}</p>

            <div style={{ marginBottom: "24px" }}>
              <h4 style={{ fontSize: "11px", fontWeight: "800", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px" }}>
                PUBLICLY STATED COMPLIANCE CREDENTIALS
              </h4>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {(selectedTool.compliance || ["HIPAA", "SOC2", "GDPR"]).map((item: string, idx: number) => (
                  <span key={idx} style={{ backgroundColor: "#f0f9ff", border: "1px solid #bae6fd", color: "#0369a1", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    🛡️ {item}
                  </span>
                ))}
              </div>
            </div>

            {!selectedTool.isClaimed && (
              <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "16px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#581c87" }}>Are you the owner of {selectedTool.name}?</h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: "12px", color: "#7e22ce" }}>
                    Claim this profile to obtain a Verified Gold Badge, capture direct leads, and feature your tool.
                  </p>
                </div>
                <button
                  onClick={() => setActiveModal("claim")}
                  style={{ backgroundColor: "#9333ea", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "13px", border: "none", cursor: "pointer" }}
                >
                  Claim Profile
                </button>
              </div>
            )}

            <hr style={{ border: "none", borderTop: "1px solid #e2e8f0", margin: "24px 0" }} />

            <div>
              <h3 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", marginBottom: "16px" }}>Enterprise Ratings & Reviews</h3>

              <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: "700", color: "#1e293b" }}>Leave a Clinical Review</h4>

                {reviewStatus === "success" ? (
                  <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#065f46", padding: "12px", borderRadius: "8px", fontSize: "13px", fontWeight: "600", marginTop: "8px" }}>
                    ✓ Thank you for your review! It has been submitted for moderation.
                  </div>
                ) : (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!reviewComment.trim()) return;
                      setReviewStatus("submitting");

                      try {
                        await fetch("/api/contact", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            name: "Clinical Reviewer",
                            email: "support@verifiedaihub.com",
                            message: `NEW CLINICAL REVIEW for ${selectedTool.name}:\n\nReview: ${reviewComment}`,
                          }),
                        });
                        setReviewStatus("success");
                        setReviewComment("");
                      } catch (err) {
                        setReviewStatus("idle");
                        alert("Could not submit review. Please try again.");
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                      <span style={{ fontSize: "13px", color: "#475569" }}>Rating:</span>
                      <select style={{ backgroundColor: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "6px", padding: "4px 8px", fontSize: "12px", fontWeight: "600" }}>
                        <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                        <option value="4">⭐⭐⭐⭐ (4/5)</option>
                        <option value="3">⭐⭐⭐ (3/5)</option>
                        <option value="2">⭐⭐ (2/5)</option>
                        <option value="1">⭐ (1/5)</option>
                      </select>
                    </div>

                    <textarea
                      rows={3}
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Describe clinical utility, accuracy, and integration ease..."
                      style={{ width: "100%", borderRadius: "8px", border: "1px solid #cbd5e1", padding: "10px", fontSize: "12px", outline: "none", boxSizing: "border-box" }}
                    />

                    <button
                      type="submit"
                      disabled={reviewStatus === "submitting"}
                      style={{ marginTop: "10px", backgroundColor: "#0088cc", color: "#ffffff", border: "none", borderRadius: "8px", padding: "8px 16px", fontSize: "13px", fontWeight: "700", cursor: "pointer" }}
                    >
                      {reviewStatus === "submitting" ? "Submitting..." : "Submit Review"}
                    </button>
                  </form>
                )}
              </div>

              <p style={{ marginTop: "16px", fontSize: "12px", fontStyle: "italic", color: "#64748b" }}>
                No public reviews approved yet for this tool.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {activeModal === "contact" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "500px", width: "100%", padding: "32px", position: "relative" }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "16px" }}>Contact Enterprise Support</h2>
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
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#000" }}
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={contactData.email}
                  onChange={(e) => setContactData({ ...contactData, email: e.target.value })}
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#000" }}
                />
                <textarea
                  required
                  rows={4}
                  placeholder="How can we assist your organization?"
                  value={contactData.message}
                  onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
                  style={{ padding: "12px", borderRadius: "8px", border: "1px solid #cbd5e1", color: "#000" }}
                />
                <button
                  type="submit"
                  disabled={contactStatus === "submitting"}
                  style={{ backgroundColor: "#0284c7", color: "#fff", padding: "12px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}
                >
                  {contactStatus === "submitting" ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* About Modal */}
      {activeModal === "about" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "500px", width: "100%", padding: "32px", position: "relative" }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "12px" }}>About VerifiedAIHub</h2>
            <p style={{ color: "#334155", lineHeight: "1.7" }}>
              VerifiedAIHub is an enterprise-grade directory built to evaluate, index, and surface artificial intelligence tools across regulated health, life sciences, and compliance-driven industries.
            </p>
          </div>
        </div>
      )}

      {/* Privacy Modal */}
      {activeModal === "privacy" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "500px", width: "100%", padding: "32px", position: "relative" }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "12px" }}>Privacy Policy</h2>
            <p style={{ color: "#334155", lineHeight: "1.7" }}>
              We respect data confidentiality and do not transmit user interactions to third parties without consent.
            </p>
          </div>
        </div>
      )}

      {/* Terms Modal */}
      {activeModal === "terms" && (
        <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", zIndex: 1000, display: "flex", justifyContent: "center", alignItems: "center", padding: "20px" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "500px", width: "100%", padding: "32px", position: "relative" }}>
            <button
              onClick={() => setActiveModal(null)}
              style={{ position: "absolute", top: "20px", right: "20px", background: "#f1f5f9", border: "none", width: "32px", height: "32px", borderRadius: "50%", cursor: "pointer", fontWeight: "bold", fontSize: "16px" }}
            >
              ✕
            </button>
            <h2 style={{ fontSize: "24px", fontWeight: "900", color: "#0f172a", marginBottom: "12px" }}>Terms of Service</h2>
            <p style={{ color: "#334155", lineHeight: "1.7" }}>
              VerifiedAIHub provides software information for research and directory reference. Vendor details are subject to independent vendor verification.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}