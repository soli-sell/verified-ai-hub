"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

const CATEGORIES = ["Healthcare", "Life Sciences", "Diagnostics", "Biotech", "Pharma", "Financial Health"];
const COMPLIANCE_OPTIONS = ["HIPAA", "FDA Cleared", "SOC2", "GDPR", "ISO 27001", "CLIA", "HITRUST"];

export default function SubmitTool() {
  const [formData, setFormData] = useState({
    name: "",
    category: "Healthcare",
    description: "",
    url: "",
    submitter_email: "", pricing: "Contact for Pricing",
  });

  const [selectedCompliance, setSelectedCompliance] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const toggleCompliance = (item: string) => {
    if (selectedCompliance.includes(item)) {
      setSelectedCompliance(selectedCompliance.filter((c) => c !== item));
    } else {
      setSelectedCompliance([...selectedCompliance, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    let formattedUrl = formData.url.trim();
    if (formattedUrl && !formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const { error } = await supabase.from("tools").insert([
      {
        name: formData.name,
        category: formData.category,
        description: formData.description,
        url: formattedUrl,
        submitter_email: formData.submitter_email,
        compliance: selectedCompliance,
        status: "pending"
      }
    ]);

    setIsSubmitting(false);

    if (error) {
      setSubmitStatus("error");
      setErrorMessage(error.message);
    } else {
      setSubmitStatus("success");
      setFormData({ name: "", category: "Healthcare", description: "", url: "", submitter_email: "" });
      setSelectedCompliance([]);
    }
  };

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", color: "#0f172a", fontFamily: "sans-serif" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #bae6fd", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <div style={{ width: "32px", height: "32px", backgroundColor: "#0284c7", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "900", fontSize: "18px" }}>V</div>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#0284c7" }}>VerifiedAIHub</span>
          </Link>
          <Link href="/" style={{ color: "#0369a1", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
            ← Back to Directory
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "800px", margin: "40px auto", padding: "0 24px" }}>
        
        {/* SUBMISSION GUIDELINES BOX */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #bae6fd", borderRadius: "16px", padding: "28px", marginBottom: "32px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "800", color: "#0f172a", margin: "0 0 12px 0" }}>Verified Listing Guidelines</h2>
          <p style={{ fontSize: "14px", color: "#475569", lineHeight: "1.6", margin: "0 0 16px 0" }}>
            To maintain high credibility standards for enterprise health system buyers, all submissions are manually reviewed before going live. Please ensure your submission meets these criteria:
          </p>
          <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "13px", color: "#334155", lineHeight: "1.8" }}>
            <li>Must belong strictly to Healthcare, Life Sciences, Biotech, Pharma, or Diagnostics.</li>
            <li>Regulatory badges (HIPAA, SOC2, FDA) must be verifiable via public documentation or enterprise terms.</li>
            <li>Generic AI tools without specific medical or life science adaptation will be rejected.</li>
          </ul>
        </div>

        {/* SUBMISSION FORM */}
        <div style={{ backgroundColor: "#ffffff", border: "1px solid #bae6fd", borderRadius: "16px", padding: "32px", boxShadow: "0 4px 12px rgba(0,0,0,0.04)" }}>
          <h1 style={{ fontSize: "24px", fontWeight: "800", marginBottom: "8px", color: "#0f172a" }}>Submit an AI Tool</h1>
          <p style={{ fontSize: "14px", color: "#64748b", marginBottom: "24px" }}>Add your solution to the enterprise evaluation queue.</p>

          {submitStatus === "success" && (
            <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "16px", borderRadius: "10px", fontSize: "14px", fontWeight: "bold", marginBottom: "24px" }}>
              ✓ Tool submitted successfully! Our editorial team will review your submission for live inclusion.
            </div>
          )}

          {submitStatus === "error" && (
            <div style={{ backgroundColor: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", padding: "16px", borderRadius: "10px", fontSize: "14px", marginBottom: "24px" }}>
              Submission error: {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Tool / Platform Name *</label>
              <input type="text" required placeholder="e.g. Nuance DAX Express" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Primary Category *</label>
                <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box" }}>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Pricing Model</label>
                <select value={formData.pricing || "Contact for Pricing"} onChange={(e) => setFormData({ ...formData, pricing: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box" }}>
                  <option value="Contact for Pricing">Contact for Pricing</option>
                  <option value="Free">Free</option>
                  <option value="Freemium">Freemium</option>
                  <option value="Paid">Paid</option>
                  <option value="Enterprise">Enterprise</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Official Website URL *</label>
              <input type="text" required placeholder="https://company.com" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Submitter / Corporate Email *</label>
              <input type="email" required placeholder="yourname@company.com" value={formData.submitter_email} onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Clinical & Technical Description *</label>
              <textarea required rows={4} placeholder="Describe clinical utility, workflow integration, and primary capabilities..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box", fontFamily: "sans-serif" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "8px" }}>Public Compliance Credentials</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {COMPLIANCE_OPTIONS.map((opt) => {
                  const isChecked = selectedCompliance.includes(opt);
                  return (
                    <button
                      type="button"
                      key={opt}
                      onClick={() => toggleCompliance(opt)}
                      style={{ padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold", cursor: "pointer", border: "1px solid #bae6fd", backgroundColor: isChecked ? "#0284c7" : "#f0f9ff", color: isChecked ? "#ffffff" : "#0369a1" }}
                    >
                      {isChecked ? `✓ ${opt}` : `+ ${opt}`}
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="submit" disabled={isSubmitting} style={{ backgroundColor: "#0284c7", color: "#ffffff", border: "none", padding: "14px", borderRadius: "10px", fontWeight: "bold", fontSize: "15px", cursor: "pointer", marginTop: "12px" }}>
              {isSubmitting ? "Submitting..." : "Submit AI Tool for Review"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
