"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState("");
  
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [pendingClaims, setPendingClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const ADMIN_SECRET = "verified2026"; // Passcode for admin access

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === ADMIN_SECRET) {
      setAuthenticated(true);
      fetchAdminData();
    } else {
      alert("Invalid Passcode");
    }
  };

  const fetchAdminData = async () => {
    setLoading(true);
    
    // Fetch pending reviews
    const { data: reviews } = await supabase
      .from("reviews")
      .select("*")
      .eq("status", "pending");
    setPendingReviews(reviews || []);

    // Fetch pending claims
    const { data: claims } = await supabase
      .from("claims")
      .select("*")
      .eq("status", "pending");
    setPendingClaims(claims || []);

    setLoading(false);
  };

  const updateStatus = async (table: string, id: number, status: string) => {
    await supabase.from(table).update({ status }).eq("id", id);
    fetchAdminData();
  };

  const deleteRecord = async (table: string, id: number) => {
    await supabase.from(table).delete().eq("id", id);
    fetchAdminData();
  };

  if (!authenticated) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8fafc", fontFamily: "sans-serif" }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "12px", border: "1px solid #e2e8f0", width: "320px", boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "16px", color: "#0f172a" }}>Admin Access</h2>
          <input
            type="password"
            placeholder="Enter Admin Passcode"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", marginBottom: "16px", boxSizing: "border-box" }}
          />
          <button type="submit" style={{ width: "100%", backgroundColor: "#0284c7", color: "#ffffff", border: "none", padding: "10px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px", maxWidth: "1000px", margin: "0 auto", fontFamily: "sans-serif", backgroundColor: "#ffffff" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: "bold", color: "#0f172a" }}>Verified AI Hub — Admin Panel</h1>
        <button onClick={fetchAdminData} style={{ backgroundColor: "#f1f5f9", border: "1px solid #cbd5e1", padding: "8px 16px", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
          Refresh Data
        </button>
      </div>

      {loading ? <p>Loading admin records...</p> : (
        <>
          {/* PENDING REVIEWS */}
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#334155", marginBottom: "16px" }}>Pending Reviews ({pendingReviews.length})</h2>
            {pendingReviews.length === 0 ? <p style={{ color: "#64748b", fontStyle: "italic" }}>No pending reviews.</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "12px" }}>Tool ID</th>
                    <th style={{ padding: "12px" }}>Rating</th>
                    <th style={{ padding: "12px" }}>Comment</th>
                    <th style={{ padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingReviews.map((rev) => (
                    <tr key={rev.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px" }}>{rev.tool_id}</td>
                      <td style={{ padding: "12px" }}>{"⭐".repeat(rev.rating || 5)}</td>
                      <td style={{ padding: "12px" }}>{rev.comment}</td>
                      <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                        <button onClick={() => updateStatus("reviews", rev.id, "approved")} style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>Approve</button>
                        <button onClick={() => deleteRecord("reviews", rev.id)} style={{ backgroundColor: "#dc2626", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          {/* PENDING CLAIMS */}
          <section style={{ marginBottom: "40px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "bold", color: "#334155", marginBottom: "16px" }}>Pending Claims ({pendingClaims.length})</h2>
            {pendingClaims.length === 0 ? <p style={{ color: "#64748b", fontStyle: "italic" }}>No pending claims.</p> : (
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                    <th style={{ padding: "12px" }}>Tool ID</th>
                    <th style={{ padding: "12px" }}>Tool Name</th>
                    <th style={{ padding: "12px" }}>Email</th>
                    <th style={{ padding: "12px" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingClaims.map((claim) => (
                    <tr key={claim.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={{ padding: "12px" }}>{claim.tool_id}</td>
                      <td style={{ padding: "12px" }}>{claim.tool_name}</td>
                      <td style={{ padding: "12px" }}>{claim.email}</td>
                      <td style={{ padding: "12px", display: "flex", gap: "8px" }}>
                        <button onClick={() => updateStatus("claims", claim.id, "approved")} style={{ backgroundColor: "#16a34a", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>Approve</button>
                        <button onClick={() => deleteRecord("claims", claim.id)} style={{ backgroundColor: "#dc2626", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", cursor: "pointer" }}>Reject</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </div>
  );
}
