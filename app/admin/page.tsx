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
  url?: string;
  pricing?: string;
  submitter_email?: string;
  status?: string;
}

interface Post {
  id: string;
  slug: string;
  title: string;
  category: string;
  author: string;
  author_email?: string;
  excerpt: string;
  content: string;
  status?: string;
}

export default function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);

  // Data States
  const [pendingTools, setPendingTools] = useState<Tool[]>([]);
  const [approvedTools, setApprovedTools] = useState<Tool[]>([]);
  const [pendingPosts, setPendingPosts] = useState<Post[]>([]);
  
  const [activeTab, setActiveTab] = useState<"approved-tools" | "pending-tools" | "pending-posts" | "new-post">("approved-tools");
  const [actionStatus, setActionStatus] = useState("");

  // Direct Admin Article Form
  const [postData, setPostData] = useState({
    slug: "",
    title: "",
    category: "Compliance & Security",
    read_time: "5 min read",
    author: "VerifiedAIHub Editorial Board",
    excerpt: "",
    content: ""
  });

  const fetchAdminData = async () => {
    // 1. Fetch Approved Live Tools
    const { data: approvedData } = await supabase
      .from("tools")
      .select("*")
      .or("status.eq.approved,status.is.null")
      .order("id", { ascending: false });
    if (approvedData) setApprovedTools(approvedData);

    // 2. Fetch Pending Tools
    const { data: pendingToolsData } = await supabase
      .from("tools")
      .select("*")
      .eq("status", "pending")
      .order("id", { ascending: false });
    if (pendingToolsData) setPendingTools(pendingToolsData);

    // 3. Fetch Pending Guest Posts
    const { data: pendingPostsData } = await supabase
      .from("posts")
      .select("*")
      .eq("status", "pending")
      .order("id", { ascending: false });
    if (pendingPostsData) setPendingPosts(pendingPostsData);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAdminData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "admin2026") {
      setIsAuthenticated(true);
      setAuthError(false);
    } else {
      setAuthError(true);
    }
  };

  // Tool Actions
  const handleApproveTool = async (id: string) => {
    const { error } = await supabase.from("tools").update({ status: "approved" }).eq("id", id);
    if (!error) {
      setActionStatus("✓ Tool marked as Approved and published to homepage!");
      fetchAdminData();
    }
  };

  const handleSetPendingTool = async (id: string) => {
    const { error } = await supabase.from("tools").update({ status: "pending" }).eq("id", id);
    if (!error) {
      setActionStatus("✓ Tool moved back to Pending status.");
      fetchAdminData();
    }
  };

  const handleDeleteTool = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this tool listing?")) {
      const { error } = await supabase.from("tools").delete().eq("id", id);
      if (!error) {
        setActionStatus("✓ Tool permanently deleted from database.");
        fetchAdminData();
      }
    }
  };

  // Post Actions
  const handleApprovePost = async (id: string) => {
    const { error } = await supabase.from("posts").update({ status: "approved" }).eq("id", id);
    if (!error) {
      setActionStatus("✓ Article approved and published live to /blog!");
      fetchAdminData();
    }
  };

  const handleRejectPost = async (id: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (!error) {
      setActionStatus("✓ Guest article rejected and deleted.");
      fetchAdminData();
    }
  };

  const handleDirectPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionStatus("");

    const formattedSlug = postData.slug.toLowerCase().replace(/\s+/g, "-");

    const { error } = await supabase.from("posts").insert([
      {
        ...postData,
        slug: formattedSlug,
        status: "approved"
      }
    ]);

    if (error) {
      setActionStatus(`Error publishing: ${error.message}`);
    } else {
      setActionStatus("✓ Direct Admin Article published live to /blog!");
      setPostData({
        slug: "",
        title: "",
        category: "Compliance & Security",
        read_time: "5 min read",
        author: "VerifiedAIHub Editorial Board",
        excerpt: "",
        content: ""
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif", padding: "20px" }}>
        <div style={{ backgroundColor: "#ffffff", padding: "32px", borderRadius: "16px", border: "1px solid #bae6fd", maxWidth: "400px", width: "100%", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px", justifyContent: "center" }}>
            <div style={{ width: "36px", height: "36px", backgroundColor: "#0284c7", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "900", fontSize: "20px" }}>V</div>
            <span style={{ fontSize: "22px", fontWeight: "900", color: "#0284c7" }}>VerifiedAIHub</span>
          </div>

          <h2 style={{ fontSize: "18px", fontWeight: "800", textAlign: "center", color: "#0f172a", marginBottom: "20px" }}>Admin Management Access</h2>

          {authError && (
            <div style={{ backgroundColor: "#fef2f2", color: "#b91c1c", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "16px", textAlign: "center" }}>
              Incorrect Access Passcode.
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <input
              type="password"
              placeholder="Enter Admin Passcode"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #bae6fd", fontSize: "14px", boxSizing: "border-box" }}
            />
            <button type="submit" style={{ backgroundColor: "#0284c7", color: "#ffffff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", cursor: "pointer" }}>
              Access Control Panel
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#f0f9ff", minHeight: "100vh", color: "#0f172a", fontFamily: "sans-serif" }}>
      {/* Header */}
      <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #bae6fd", padding: "16px 24px" }}>
        <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "32px", height: "32px", backgroundColor: "#0284c7", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "#ffffff", fontWeight: "900", fontSize: "18px" }}>V</div>
            <span style={{ fontSize: "20px", fontWeight: "900", color: "#0284c7" }}>VerifiedAIHub Admin Panel</span>
          </div>
          <Link href="/" style={{ color: "#0369a1", textDecoration: "none", fontWeight: "bold", fontSize: "14px" }}>
            ← View Public Directory
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: "1100px", margin: "32px auto", padding: "0 24px" }}>
        
        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}>
          <button
            onClick={() => { setActiveTab("approved-tools"); setActionStatus(""); }}
            style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #bae6fd", backgroundColor: activeTab === "approved-tools" ? "#0284c7" : "#ffffff", color: activeTab === "approved-tools" ? "#ffffff" : "#0369a1", fontWeight: "bold", cursor: "pointer" }}
          >
            Approved Tools ({approvedTools.length})
          </button>

          <button
            onClick={() => { setActiveTab("pending-tools"); setActionStatus(""); }}
            style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #bae6fd", backgroundColor: activeTab === "pending-tools" ? "#0284c7" : "#ffffff", color: activeTab === "pending-tools" ? "#ffffff" : "#0369a1", fontWeight: "bold", cursor: "pointer" }}
          >
            Pending Tools ({pendingTools.length})
          </button>

          <button
            onClick={() => { setActiveTab("pending-posts"); setActionStatus(""); }}
            style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #bae6fd", backgroundColor: activeTab === "pending-posts" ? "#0284c7" : "#ffffff", color: activeTab === "pending-posts" ? "#ffffff" : "#0369a1", fontWeight: "bold", cursor: "pointer" }}
          >
            Pending Guest Articles ({pendingPosts.length})
          </button>

          <button
            onClick={() => { setActiveTab("new-post"); setActionStatus(""); }}
            style={{ padding: "10px 20px", borderRadius: "8px", border: "1px solid #bae6fd", backgroundColor: activeTab === "new-post" ? "#0284c7" : "#ffffff", color: activeTab === "new-post" ? "#ffffff" : "#0369a1", fontWeight: "bold", cursor: "pointer" }}
          >
            + Create Admin Article
          </button>
        </div>

        {actionStatus && (
          <div style={{ backgroundColor: "#ecfdf5", border: "1px solid #a7f3d0", color: "#047857", padding: "14px 18px", borderRadius: "8px", fontWeight: "bold", fontSize: "14px", marginBottom: "24px" }}>
            {actionStatus}
          </div>
        )}

        {/* TAB 1: APPROVED LIVE TOOLS MANAGER */}
        {activeTab === "approved-tools" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e0f2fe", padding: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "16px" }}>Approved Directory Listings ({approvedTools.length})</h2>
            {approvedTools.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "14px" }}>No approved tools found in database.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {approvedTools.map((tool) => (
                  <div key={tool.id} style={{ border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "20px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>{tool.category}</span>
                        <span style={{ backgroundColor: "#dcfce7", color: "#15803d", fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>Approved</span>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{tool.name}</h3>
                      </div>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#334155" }}>{tool.description}</p>
                    </div>

                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <button onClick={() => handleApproveTool(tool.id)} style={{ backgroundColor: "#16a34a", color: "#ffffff", border: "none", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                        Re-Approve
                      </button>
                      <button onClick={() => handleSetPendingTool(tool.id)} style={{ backgroundColor: "#d97706", color: "#ffffff", border: "none", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                        Move to Pending
                      </button>
                      <button onClick={() => handleDeleteTool(tool.id)} style={{ backgroundColor: "#dc2626", color: "#ffffff", border: "none", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "12px" }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PENDING TOOLS QUEUE */}
        {activeTab === "pending-tools" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e0f2fe", padding: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "16px" }}>Pending AI Tool Audits ({pendingTools.length})</h2>
            {pendingTools.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "14px" }}>No pending tool submissions requiring review.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {pendingTools.map((tool) => (
                  <div key={tool.id} style={{ border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", backgroundColor: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "start", gap: "20px" }}>
                    <div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                        <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>{tool.category}</span>
                        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: "bold" }}>{tool.name}</h3>
                      </div>
                      <p style={{ margin: "4px 0 8px 0", fontSize: "14px", color: "#334155" }}>{tool.description}</p>
                      <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>URL: {tool.url || 'N/A'} | Submitter: {tool.submitter_email || 'Public Form'}</p>
                    </div>

                    <div style={{ display: "flex", gap: "8px" }}>
                      <button onClick={() => handleApproveTool(tool.id)} style={{ backgroundColor: "#16a34a", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>Approve & Publish</button>
                      <button onClick={() => handleDeleteTool(tool.id)} style={{ backgroundColor: "#dc2626", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PENDING GUEST ARTICLES */}
        {activeTab === "pending-posts" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e0f2fe", padding: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "16px" }}>Pending Guest Articles & Case Studies ({pendingPosts.length})</h2>
            {pendingPosts.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: "14px" }}>No pending guest articles requiring review.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {pendingPosts.map((post) => (
                  <div key={post.id} style={{ border: "1px solid #e2e8f0", padding: "20px", borderRadius: "12px", backgroundColor: "#f8fafc" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "12px" }}>
                      <div>
                        <span style={{ backgroundColor: "#e0f2fe", color: "#0369a1", fontSize: "11px", fontWeight: "bold", padding: "2px 8px", borderRadius: "4px" }}>{post.category}</span>
                        <h3 style={{ margin: "6px 0 2px 0", fontSize: "18px", fontWeight: "bold" }}>{post.title}</h3>
                        <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>By {post.author} ({post.author_email})</p>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleApprovePost(post.id)} style={{ backgroundColor: "#16a34a", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>Approve & Publish</button>
                        <button onClick={() => handleRejectPost(post.id)} style={{ backgroundColor: "#dc2626", color: "#ffffff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}>Reject</button>
                      </div>
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: "bold", color: "#334155", marginBottom: "8px" }}>Excerpt: {post.excerpt}</p>
                    <div style={{ fontSize: "13px", color: "#475569", backgroundColor: "#ffffff", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8f0", maxHeight: "150px", overflowY: "auto", whiteSpace: "pre-line" }}>
                      {post.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DIRECT ADMIN ARTICLE CREATOR */}
        {activeTab === "new-post" && (
          <div style={{ backgroundColor: "#ffffff", borderRadius: "16px", border: "1px solid #e0f2fe", padding: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: "800", marginBottom: "20px" }}>Publish Direct Admin Article</h2>
            <form onSubmit={handleDirectPublish} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Article Title *</label>
                <input type="text" required placeholder="Title..." value={postData.title} onChange={(e) => setPostData({ ...postData, title: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Slug *</label>
                  <input type="text" required placeholder="article-slug" value={postData.slug} onChange={(e) => setPostData({ ...postData, slug: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Category *</label>
                  <select value={postData.category} onChange={(e) => setPostData({ ...postData, category: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd", boxSizing: "border-box" }}>
                    <option value="Compliance & Security">Compliance & Security</option>
                    <option value="Regulatory Insights">Regulatory Insights</option>
                    <option value="Case Studies">Case Studies</option>
                    <option value="Product Spotlights">Product Spotlights</option>
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Excerpt *</label>
                <textarea required rows={2} value={postData.excerpt} onChange={(e) => setPostData({ ...postData, excerpt: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd", boxSizing: "border-box" }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "bold", marginBottom: "6px" }}>Full Content *</label>
                <textarea required rows={8} value={postData.content} onChange={(e) => setPostData({ ...postData, content: e.target.value })} style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #bae6fd", boxSizing: "border-box", fontFamily: "sans-serif" }} />
              </div>
              <button type="submit" style={{ backgroundColor: "#0284c7", color: "#ffffff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "bold", fontSize: "15px", cursor: "pointer" }}>Publish Article Live</button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
