"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

// Clean base URL to prevent "Invalid path specified in request URL"
const supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim().replace(/\/+$/, "");
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "").trim();

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  
  const [pendingTools, setPendingTools] = useState<any[]>([]);
  const [activeTools, setActiveTools] = useState<any[]>([]);
  const [guestArticles, setGuestArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const ADMIN_SECRET = "verified2026";

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_SECRET) {
      setAuthenticated(true);
      fetchData();
    } else {
      alert("Invalid Passcode");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMessage("");
    
    try {
      // 1. Fetch pending submissions
      const { data: pending, error: pErr } = await supabase
        .from("tools")
        .select("*")
        .eq("status", "pending");
      if (pErr) console.error("Pending tools error:", pErr);
      setPendingTools(pending || []);

      // 2. Fetch all tools
      const { data: allTools, error: tErr } = await supabase
        .from("tools")
        .select("*");

      if (tErr) {
        console.error("All tools fetch error:", tErr);
        setErrorMessage(`Supabase Error: ${tErr.message}`);
      } else {
        const reviewed = (allTools || []).filter((t: any) => t.status !== "pending");
        setActiveTools(reviewed);
      }

      // 3. Fetch claims queue
      const { data: claims, error: cErr } = await supabase
        .from("claims")
        .select("*");
      if (cErr) console.error("Claims fetch error:", cErr);
      setGuestArticles(claims || []);

    } catch (err: any) {
      setErrorMessage(err.message || "Failed to fetch database records.");
    } finally {
      setLoading(false);
    }
  };

  const updateToolStatus = async (id: number, status: string) => {
    await supabase.from("tools").update({ status }).eq("id", id);
    fetchData();
  };

  const deleteTool = async (id: number) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      await supabase.from("tools").delete().eq("id", id);
      fetchData();
    }
  };

  if (!authenticated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#e2e8f0", fontFamily: "sans-serif" }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "12px", width: "320px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", color: "#0f172a" }}>Admin Access</h2>
          <input
            type="password"
            placeholder="Enter Admin Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "16px", boxSizing: "border-box" }}
          />
          <button type="submit" style={{ width: "100%", backgroundColor: "#1d4ed8", color: "#ffffff", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#dbece9", fontFamily: "sans-serif", paddingBottom: "60px" }}>
      {/* Top Header Banner */}
      <header style={{ backgroundColor: "#1e40af", padding: "14px 28px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ backgroundColor: "#ffffff", color: "#1e40af", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px", fontSize: "14px" }}>V</div>
          <span style={{ color: "#ffffff", fontWeight: "bold", fontSize: "16px" }}>VerifiedAIHub — Admin Panel</span>
        </div>
        <Link href="/" style={{ color: "#ffffff", textDecoration: "none", fontSize: "13px", fontWeight: "600" }}>
          ← Back to Homepage
        </Link>
      </header>

      <main style={{ maxWidth: "1100px", margin: "32px auto 0 auto", padding: "0 20px" }}>
        
        {errorMessage && (
          <div style={{ backgroundColor: "#fee2e2", color: "#b91c1c", padding: "12px 16px", borderRadius: "8px", marginBottom: "20px", fontWeight: "bold", fontSize: "14px" }}>
            {errorMessage}
          </div>
        )}

        {/* Guest Articles & Inquiries Box */}
        <section style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "28px", marginBottom: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: guestArticles.length > 0 ? "20px" : "0" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              📝 Guest Articles & Claims Queue
            </h2>
            <span style={{ backgroundColor: "#e0e7ff", color: "#3730a3", padding: "4px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "bold" }}>
              Requests: {guestArticles.length}
            </span>
          </div>

          {guestArticles.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: "14px" }}>
              No guest articles or owner claim requests awaiting action.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ color: "#64748b", fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid #f1f5f9", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px" }}>Tool ID / Name</th>
                  <th style={{ padding: "12px" }}>Contact Email</th>
                  <th style={{ padding: "12px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {guestArticles.map((art) => (
                  <tr key={art.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "12px", fontWeight: "bold", color: "#0f172a" }}>{art.tool_name || `Tool ID: ${art.tool_id}`}</td>
                    <td style={{ padding: "12px", fontSize: "13px", color: "#334155" }}>{art.email}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{ backgroundColor: art.status === "approved" ? "#dcfce7" : "#fef3c7", color: art.status === "approved" ? "#15803d" : "#d97706", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>
                        {art.status || "pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Pending Submissions Queue Card */}
        <section style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "28px", marginBottom: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: pendingTools.length > 0 ? "20px" : "0" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              ⏳ Pending Submissions Queue
            </h2>
            <span style={{ backgroundColor: "#ffedd5", color: "#c2410c", padding: "4px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "bold" }}>
              Pending: {pendingTools.length}
            </span>
          </div>

          {pendingTools.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: "14px" }}>
              No new submissions awaiting review.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ color: "#64748b", fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid #f1f5f9", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px" }}>Tool Name</th>
                  <th style={{ padding: "12px" }}>Category</th>
                  <th style={{ padding: "12px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pendingTools.map((tool) => (
                  <tr key={tool.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ fontWeight: "bold", color: "#0f172a" }}>{tool.name}</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>{tool.description}</div>
                    </td>
                    <td style={{ padding: "16px 12px", fontSize: "13px", color: "#334155" }}>{tool.category || "Healthcare"}</td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => updateToolStatus(tool.id, "approved")} style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}>Approve</button>
                        <button onClick={() => updateToolStatus(tool.id, "rejected")} style={{ backgroundColor: "#ea580c", color: "#fff", border: "none", padding: "6px 14px", borderRadius: "6px", fontWeight: "bold", fontSize: "12px", cursor: "pointer" }}>Reject</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Active & Reviewed Listings Card */}
        <section style={{ backgroundColor: "#ffffff", borderRadius: "12px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "bold", color: "#0f172a", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              📄 Active & Reviewed Listings
            </h2>
            <span style={{ backgroundColor: "#dbeafe", color: "#1e40af", padding: "4px 12px", borderRadius: "16px", fontSize: "12px", fontWeight: "bold" }}>
              Total Reviewed: {activeTools.length}
            </span>
          </div>

          {activeTools.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px 0", color: "#64748b", fontSize: "14px" }}>
              No active listings found in database.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
              <thead>
                <tr style={{ color: "#64748b", fontSize: "11px", fontWeight: "bold", borderBottom: "1px solid #f1f5f9", textTransform: "uppercase" }}>
                  <th style={{ padding: "12px", width: "35%" }}>Tool Name</th>
                  <th style={{ padding: "12px" }}>Category</th>
                  <th style={{ padding: "12px" }}>Status</th>
                  <th style={{ padding: "12px" }}>Badges</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeTools.map((tool) => (
                  <tr key={tool.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ fontWeight: "bold", color: "#0f172a", fontSize: "14px" }}>{tool.name}</div>
                      <div style={{ fontSize: "12px", color: "#64748b", marginTop: "2px" }}>{tool.description}</div>
                    </td>
                    <td style={{ padding: "16px 12px", fontSize: "13px", color: "#334155" }}>{tool.category || "Healthcare"}</td>
                    <td style={{ padding: "16px 12px" }}>
                      <span style={{ backgroundColor: tool.status === "rejected" ? "#fee2e2" : "#dcfce7", color: tool.status === "rejected" ? "#b91c1c" : "#15803d", padding: "3px 10px", borderRadius: "12px", fontSize: "11px", fontWeight: "bold", textTransform: "uppercase" }}>
                        {tool.status ? tool.status.toUpperCase() : "APPROVED"}
                      </span>
                    </td>
                    <td style={{ padding: "16px 12px" }}>
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        <span style={{ backgroundColor: "#f1f5f9", color: "#475569", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px" }}>HIPAA</span>
                        <span style={{ backgroundColor: "#f1f5f9", color: "#475569", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px" }}>SOC2</span>
                        {tool.name !== "BioGPT Clinical" && (
                          <span style={{ backgroundColor: "#f1f5f9", color: "#475569", fontSize: "10px", fontWeight: "bold", padding: "2px 6px", borderRadius: "4px" }}>FDA</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "16px 12px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end", alignItems: "center" }}>
                        <a href={tool.url || "#"} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", fontSize: "12px", fontWeight: "bold", textDecoration: "none", marginRight: "4px" }}>Visit ↗</a>
                        <button onClick={() => updateToolStatus(tool.id, "approved")} style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }}>Re-approve</button>
                        <button onClick={() => updateToolStatus(tool.id, "pending")} style={{ backgroundColor: "#d97706", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }}>Pending</button>
                        <button onClick={() => deleteTool(tool.id)} style={{ backgroundColor: "#dc2626", color: "#fff", border: "none", padding: "5px 10px", borderRadius: "6px", fontWeight: "bold", fontSize: "11px", cursor: "pointer" }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
