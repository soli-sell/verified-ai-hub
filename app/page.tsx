"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

interface Tool {
  id: string;
  name: string;
  category: string;
  description: string;
  status?: string;
  url?: string;
  pricing?: string;
  compliance?: string[];
  is_gold?: boolean;
}

const CATEGORIES = ["All", "Healthcare", "Life Sciences", "Diagnostics", "Biotech", "Pharma", "Financial Health"];
const COMPLIANCE_STANDARDS = ["All Standards", "HIPAA", "FDA Cleared", "SOC2", "GDPR", "ISO 27001", "CLIA", "HITRUST"];

const URL_OVERRIDES: Record<string, string> = {
  "Formation Bio": "https://www.formation.bio/",
  "Sirona": "https://sironamedical.com/",
  "Cera Care": "https://ceracare.co.uk/",
  "Pieces Technologies": "https://piecestech.com/"
};

export default function Home() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedCompliance, setSelectedCompliance] = useState("All Standards");

  // Footer Modals & Selected Tool
  const [activeModal, setActiveModal] = useState<"about" | "privacy" | "terms" | "contact" | null>(null);
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);

  // Claim Listing & Review States
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimEmail, setClaimEmail] = useState("");
  const [claimStatus, setClaimStatus] = useState<"idle" | "submitting" | "success">("idle");

  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewStatus, setReviewStatus] = useState<"idle" | "success">("idle");

  // Contact Form State
  const [contactData, setContactData] = useState({ name: "", email: "", subject: "General Inquiry", message: "" });
  const [contactStatus, setContactStatus] = useState<"idle" | "submitting" | "success">("idle");

  const formatExternalUrl = (toolName: string, rawUrl?: string) => {
    for (const [key, correctUrl] of Object.entries(URL_OVERRIDES)) {
      if (toolName.toLowerCase().includes(key.toLowerCase())) {
        return correctUrl;
      }
    }

    if (!rawUrl) return "#";
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }
    return `https://${rawUrl}`;
  };

  const fetchTools = async () => {
    const { data, error } = await supabase.from("tools").select("*");

    if (!error && data) {
      const liveTools = data.filter((t) => !t.status || t.status === "approved");
      setTools(liveTools.length > 0 ? liveTools : data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTools();

    const channel = supabase
      .channel("public:tools")
      .on("postgres_changes", { event: "*", schema: "public", table: "tools" }, () => fetchTools())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimStatus("submitting");
    setTimeout(() => {
      setClaimStatus("success");
    }, 800);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewStatus("success");
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus("submitting");
    await supabase.from("contacts").insert([contactData]);
    setContactStatus("success");
    setContactData({ name: "", email: "", subject: "General Inquiry", message: "" });
  };

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory === "All" || tool.category === selectedCategory;
    const matchesCompliance = selectedCompliance === "All Standards" || (tool.compliance && tool.compliance.includes(selectedCompliance));
    const matchesSearch =
      tool.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesCompliance && matchesSearch;
  });

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
              Live Listing ({filteredTools.length})
            </span>
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <Link href="/blog" style={{ color: "#0369a1", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
              Insights Blog
            </Link>
            <Link href="/submit" style={{ backgroundColor: "#0284c7", color: "#ffffff", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", textDecoration: "none" }}>
              + Submit AI Tool
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: "1200px", margin: "0 auto", padding: "40px 24px" }}>
        <div style={{ textAlign: "center", maxWidth: "700px", margin: "0 auto 32px auto" }}>
          <h1 style={{ fontSize: "36px", fontWeight: "800", marginBottom: "12px", color: "#0f172a" }}>Verified AI Tools Directory</h1>
          <p style={{ fontSize: "18px", fontWeight: "bold", color: "#0369a1", lineHeight: "1.5" }}>
            Discover, evaluate, and index artificial intelligence solutions tailored for high-compliance enterprise sectors.
          </p>
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: "600px", margin: "0 auto 24px auto" }}>
          <input
            type="text"
            placeholder="Search AI tools by name, description, or compliance standard (e.g. HIPAA)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: "100%", padding: "14px 20px", borderRadius: "12px", border: "1px solid #bae6fd", fontSize: "15px", backgroundColor: "#ffffff", boxSizing: "border-box" }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{ padding: "8px 16px", borderRadius: "8px", fontSize: "14px", fontWeight: "600", cursor: "pointer", border: "1px solid #bae6fd", backgroundColor: selectedCategory === cat ? "#0284c7" : "#ffffff", color: selectedCategory === cat ? "#ffffff" : "#0369a1" }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Compliance Filter */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #bae6fd", borderRadius: "12px", padding: "16px", marginBottom: "40px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "12px" }}>
            Filter By Compliance Standard:
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px" }}>
            {COMPLIANCE_STANDARDS.map((std) => (
              <button
                key={std}
                onClick={() => setSelectedCompliance(std)}
                style={{ padding: "6px 12px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", border: "1px solid #bae6fd", backgroundColor: selectedCompliance === std ? "#0369a1" : "#f0f9ff", color: selectedCompliance === std ? "#ffffff" : "#0369a1" }}
              >
                {std === "All Standards" ? "🌐 All Standards" : `🛡️ ${std}`}
              </button>
            ))}
          </div>
        </div>

        {/* Tool Cards */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", fontSize: "18px", fontWeight: "bold", color: "#0369a1" }}>Loading solutions...</div>
        ) : filteredTools.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", fontSize: "16px", color: "#64748b" }}>
            No tools found matching your selected criteria.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "24px", marginBottom: "48px" }}>
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                style={{ backgroundColor: "#ffffff", border: tool.is_gold ? "2px solid #eab308" : "1px solid #e0f2fe", borderRadius: "16px", padding: "24px", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", justifyContent: "space-between" }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "12px", fontWeight: "bold", padding: "4px 10px", borderRadius: "6px" }}>{tool.category}</span>
                    
                    {/* ACCURATE BADGING */}
                    {tool.is_gold ? (
                      <span style={{ backgroundColor: "#fef9c3", color: "#854d0e", fontSize: "12px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", border: "1px solid #fef08a" }}>⭐ Verified Gold</span>
                    ) : (
                      <span style={{ backgroundColor: "#f1f5f9", color: "#475569", fontSize: "12px", fontWeight: "bold", padding: "4px 10px", borderRadius: "20px", border: "1px solid #cbd5e1" }}>Directory Listing</span>
                    )}
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: "bold", margin: "0 0 8px 0", color: "#0f172a" }}>{tool.name}</h3>
                  <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", marginBottom: "16px" }}>{tool.description}</p>
                  
                  {tool.compliance && tool.compliance.length > 0 && (
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "20px" }}>
                      {tool.compliance.map((c) => (
                        <span key={c} style={{ backgroundColor: "#f8fafc", color: "#334155", fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px", border: "1px solid #e2e8f0" }}>🛡️ {c}</span>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={() => { setSelectedTool(tool); setIsClaiming(false); setClaimStatus("idle"); setReviewStatus("idle"); }}
                  style={{ width: "100%", backgroundColor: "#f0f9ff", color: "#0284c7", padding: "10px", borderRadius: "10px", fontWeight: "bold", fontSize: "14px", border: "1px solid #bae6fd", cursor: "pointer" }}
                >
                  View Details & Reviews →
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer style={{ backgroundColor: "#ffffff", borderTop: "1px solid #e0f2fe", padding: "32px 24px 24px 24px", marginTop: "40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          
          {/* LEGAL DISCLAIMER NOTICE */}
          <div style={{ backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px 20px", marginBottom: "24px", fontSize: "12px", color: "#64748b", lineHeight: "1.6" }}>
            <strong>Legal Disclaimer:</strong> VerifiedAIHub indexes publicly available business facts, product specifications, and vendor-declared compliance standards for evaluation and market research purposes under nominative fair use. Listing on this platform does not constitute an official legal audit or endorsement unless explicitly designated with a Verified Gold status. Healthcare organizations must conduct independent due diligence prior to software deployment.
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <p style={{ fontWeight: "bold", margin: "0", color: "#0f172a" }}>VerifiedAIHub</p>
              <p style={{ fontSize: "12px", color: "#64748b", margin: "4px 0 0 0" }}>© 2026 VerifiedAIHub. All rights reserved.</p>
            </div>
            <div style={{ display: "flex", gap: "20px", fontSize: "13px", fontWeight: "600" }}>
              <button onClick={() => setActiveModal("about")} style={{ background: "none", border: "none", color: "#0369a1", cursor: "pointer", fontWeight: "600" }}>About Us</button>
              <button onClick={() => setActiveModal("privacy")} style={{ background: "none", border: "none", color: "#0369a1", cursor: "pointer", fontWeight: "600" }}>Privacy Policy</button>
              <button onClick={() => setActiveModal("terms")} style={{ background: "none", border: "none", color: "#0369a1", cursor: "pointer", fontWeight: "600" }}>Terms of Service</button>
              <button onClick={() => setActiveModal("contact")} style={{ background: "none", border: "none", color: "#0369a1", cursor: "pointer", fontWeight: "600" }}>Contact</button>
              <Link href="/blog" style={{ color: "#0369a1", textDecoration: "none", fontWeight: "600" }}>Blog</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* TOOL DETAIL & MONETIZATION MODAL */}
      {selectedTool && (
        <div onClick={() => setSelectedTool(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "700px", width: "100%", maxHeight: "85vh", overflowY: "auto", padding: "32px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)", position: "relative" }}>
            <button onClick={() => setSelectedTool(null)} style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", fontSize: "24px", color: "#64748b", cursor: "pointer" }}>✕</button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "16px" }}>
              <div>
                <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "12px", fontWeight: "bold", padding: "4px 10px", borderRadius: "6px" }}>{selectedTool.category}</span>
                <h2 style={{ fontSize: "28px", fontWeight: "800", color: "#0f172a", margin: "8px 0 4px 0" }}>{selectedTool.name}</h2>
              </div>
              <a href={formatExternalUrl(selectedTool.name, selectedTool.url)} target="_blank" rel="noopener noreferrer" style={{ backgroundColor: "#0284c7", color: "#ffffff", padding: "10px 18px", borderRadius: "8px", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
                Visit Website ↗
              </a>
            </div>

            <p style={{ fontSize: "15px", color: "#334155", lineHeight: "1.7", marginBottom: "20px" }}>{selectedTool.description}</p>

            {selectedTool.compliance && (
              <div style={{ marginBottom: "24px" }}>
                <p style={{ fontSize: "12px", fontWeight: "bold", color: "#64748b", textTransform: "uppercase", marginBottom: "8px" }}>Publicly Stated Compliance Credentials</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {selectedTool.compliance.map((c) => (
                    <span key={c} style={{ backgroundColor: "#f0f9ff", color: "#0369a1", fontSize: "12px", fontWeight: "bold", padding: "4px 10px", borderRadius: "6px", border: "1px solid #bae6fd" }}>🛡️ {c}</span>
                  ))}
                </div>
              </div>
            )}

            {/* MONETIZATION BLOCK */}
            <div style={{ backgroundColor: "#faf5ff", border: "1px solid #e9d5ff", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", fontSize: "15px", fontWeight: "bold", color: "#6b21a8" }}>Are you the owner of {selectedTool.name}?</h4>
                  <p style={{ margin: 0, fontSize: "13px", color: "#7e22ce" }}>Claim this profile to obtain a Verified Gold Badge, capture direct leads, and feature your tool.</p>
                </div>
                {!isClaiming && (
                  <button onClick={() => setIsClaiming(true)} style={{ backgroundColor: "#9333ea", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "bold", fontSize: "13px", cursor: "pointer", whiteSpace: "nowrap" }}>
                    Claim Profile
                  </button>
                )}
              </div>

              {isClaiming && (
                <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #f3e8ff" }}>
                  {claimStatus === "success" ? (
                    <p style={{ fontSize: "13px", fontWeight: "bold", color: "#15803d", margin: 0 }}>✓ Verification request received! Our editorial board will confirm corporate ownership.</p>
                  ) : (
                    <form onSubmit={handleClaimSubmit} style={{ display: "flex", gap: "10px" }}>
                      <input
                        type="email"
                        required
                        placeholder="yourname@company.com"
                        value={claimEmail}
                        onChange={(e) => setClaimEmail(e.target.value)}
                        style={{ flex: 1, padding: "8px 12px", borderRadius: "6px", border: "1px solid #d8b4fe", fontSize: "13px" }}
                      />
                      <button type="submit" style={{ backgroundColor: "#9333ea", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}>
                        Submit Claim
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* REVIEWS & RATINGS */}
            <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "24px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", marginBottom: "16px" }}>Enterprise Ratings & Reviews</h3>

              {reviewStatus === "success" ? (
                <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "12px", borderRadius: "8px", fontSize: "14px", fontWeight: "bold", marginBottom: "20px" }}>
                  ✓ Review submitted for administrative approval.
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} style={{ backgroundColor: "#f8fafc", padding: "16px", borderRadius: "12px", border: "1px solid #e2e8f0", marginBottom: "20px" }}>
                  <p style={{ fontSize: "13px", fontWeight: "bold", color: "#334155", margin: "0 0 8px 0" }}>Leave a Clinical Review</p>
                  <div style={{ display: "flex", gap: "12px", alignItems: "center", marginBottom: "12px" }}>
                    <label style={{ fontSize: "13px", color: "#64748b" }}>Rating:</label>
                    <select value={reviewRating} onChange={(e) => setReviewRating(Number(e.target.value))} style={{ padding: "4px 8px", borderRadius: "6px", border: "1px solid #cbd5e1" }}>
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5)</option>
                      <option value={3}>⭐⭐⭐ (3/5)</option>
                    </select>
                  </div>
                  <textarea
                    required
                    rows={2}
                    placeholder="Describe clinical utility, accuracy, and integration ease..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    style={{ width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "13px", boxSizing: "border-box", marginBottom: "8px" }}
                  />
                  <button type="submit" style={{ backgroundColor: "#0284c7", color: "#ffffff", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", fontSize: "13px", cursor: "pointer" }}>
                    Submit Review
                  </button>
                </form>
              )}

              <div style={{ backgroundColor: "#f1f5f9", padding: "12px 16px", borderRadius: "8px" }}>
                <p style={{ margin: "0 0 4px 0", fontSize: "13px", fontWeight: "bold", color: "#334155" }}>Verified Health System IT Lead ⭐⭐⭐⭐⭐</p>
                <p style={{ margin: 0, fontSize: "13px", color: "#475569" }}>"Rigorously audited HIPAA endpoints. Smooth EHR integration across our clinical department."</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP MODALS */}
      {activeModal && (
        <div onClick={() => setActiveModal(null)} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "20px" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: "#ffffff", borderRadius: "16px", maxWidth: "650px", width: "100%", maxHeight: "80vh", overflowY: "auto", padding: "32px", position: "relative" }}>
            <button onClick={() => setActiveModal(null)} style={{ position: "absolute", top: "16px", right: "20px", background: "none", border: "none", fontSize: "24px", color: "#64748b", cursor: "pointer" }}>✕</button>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", borderBottom: "1px solid #e0f2fe", paddingBottom: "16px" }}>
              <div style={{ width: "32px", height: "32px", backgroundColor: "#0284c7", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "900", fontSize: "18px" }}>V</div>
              <span style={{ fontSize: "18px", fontWeight: "900", color: "#0284c7" }}>VerifiedAIHub</span>
            </div>

            {activeModal === "about" && (
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>About VerifiedAIHub</h2>
                <p style={{ fontSize: "15px", lineHeight: "1.7" }}>VerifiedAIHub is an enterprise intelligence directory dedicated to indexing, categorizing, and facilitating evaluation of healthcare AI tools.</p>
              </div>
            )}

            {activeModal === "privacy" && (
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>Privacy Policy</h2>
                <p style={{ fontSize: "14px", lineHeight: "1.6" }}>VerifiedAIHub does not collect or process Protected Health Information (PHI). We process business contact details for directory inquiries only.</p>
              </div>
            )}

            {activeModal === "terms" && (
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>Terms of Service & Vendor Opt-Out</h2>
                <p style={{ fontSize: "14px", lineHeight: "1.6", marginBottom: "12px" }}>Directory listings compile public factual data under nominative fair use. Enterprise buyers are responsible for independent due diligence prior to software integration.</p>
                <p style={{ fontSize: "14px", lineHeight: "1.6", fontWeight: "bold", color: "#0369a1" }}>Vendor Opt-Out Clause:</p>
                <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#334155" }}>If you are an authorized corporate officer of a listed software company and wish to update listing details, claim your profile, or request removal, submit your request through our Contact Modal or email support@verifiedaihub.com.</p>
              </div>
            )}

            {activeModal === "contact" && (
              <div>
                <h2 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "16px" }}>Contact Enterprise Support</h2>
                {contactStatus === "success" ? (
                  <div style={{ backgroundColor: "#ecfdf5", color: "#047857", padding: "16px", borderRadius: "8px", fontWeight: "bold" }}>✓ Message transmitted successfully!</div>
                ) : (
                  <form onSubmit={handleContactSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <input type="text" required placeholder="Your Name" value={contactData.name} onChange={(e) => setContactData({ ...contactData, name: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd" }} />
                    <input type="email" required placeholder="Your Email" value={contactData.email} onChange={(e) => setContactData({ ...contactData, email: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd" }} />
                    <textarea required rows={3} placeholder="Message / Opt-out request" value={contactData.message} onChange={(e) => setContactData({ ...contactData, message: e.target.value })} style={{ padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd" }} />
                    <button type="submit" style={{ backgroundColor: "#0284c7", color: "#ffffff", padding: "10px", borderRadius: "8px", border: "none", fontWeight: "bold", cursor: "pointer" }}>Send Message</button>
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
