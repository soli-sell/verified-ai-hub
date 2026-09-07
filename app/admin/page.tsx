'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [tools, setTools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchTools = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('id', { ascending: false });

    if (!error && data) {
      setTools(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authenticated) {
      fetchTools();
    }
  }, [authenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'admin2026') {
      setAuthenticated(true);
    } else {
      alert('Incorrect Password');
    }
  };

  const handleApprove = async (tool: any) => {
    setActionLoading(tool.id);
    try {
      const res = await fetch('/api/approve-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: tool.id,
          name: tool.name,
          url: tool.url,
          submitter_email: tool.submitter_email,
        }),
      });

      const resData = await res.json();

      if (res.ok) {
        fetchTools();
      } else {
        alert('Failed to approve tool: ' + (resData.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error connecting to approve route: ' + err.message);
    }
    setActionLoading(null);
  };

  const handleMoveToPending = async (id: string) => {
    setActionLoading(id);
    const { error } = await supabase
      .from('tools')
      .update({ status: 'pending' })
      .eq('id', id);

    if (!error) {
      fetchTools();
    } else {
      alert('Error updating tool status: ' + error.message);
    }
    setActionLoading(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;
    setActionLoading(id);
    const { error } = await supabase.from('tools').delete().eq('id', id);
    if (!error) {
      fetchTools();
    } else {
      alert('Error deleting tool: ' + error.message);
    }
    setActionLoading(null);
  };

  const exportToCSV = () => {
    if (tools.length === 0) {
      alert('No data to export.');
      return;
    }

    const headers = [
      'ID',
      'Name',
      'Category',
      'Pricing',
      'URL',
      'Submitter Email',
      'Status',
      'HIPAA Compliant',
      'SOC 2 Compliant',
      'FDA Cleared',
      'Description'
    ];

    const rows = tools.map((t) => [
      `"${t.id || ''}"`,
      `"${(t.name || '').replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.pricing || '').replace(/"/g, '""')}"`,
      `"${(t.url || '').replace(/"/g, '""')}"`,
      `"${(t.submitter_email || '').replace(/"/g, '""')}"`,
      `"${(t.status || 'approved').replace(/"/g, '""')}"`,
      t.hipaa_compliant ? 'Yes' : 'No',
      t.soc2_compliant ? 'Yes' : 'No',
      t.fda_cleared ? 'Yes' : 'No',
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `verified_ai_hub_tools_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!authenticated) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f1f5f9', fontFamily: 'system-ui, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ backgroundColor: '#ffffff', padding: '32px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', width: '100%', maxWidth: '360px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px', color: '#0f172a' }}>Admin Moderation Access</h2>
          <input
            type="password"
            placeholder="Enter Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '14px', marginBottom: '16px', boxSizing: 'border-box' }}
          />
          <button type="submit" style={{ width: '100%', backgroundColor: '#1d4ed8', color: '#ffffff', padding: '10px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer' }}>
            Login to Admin Panel
          </button>
        </form>
      </div>
    );
  }

  const pendingTools = tools.filter((t) => t.status === 'pending');
  const approvedTools = tools.filter((t) => t.status !== 'pending');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '32px' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>Verified AI Hub Moderation</h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: '4px 0 0 0' }}>Review, approve, and maintain listed life science tools.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button
            onClick={exportToCSV}
            style={{ backgroundColor: '#0f766e', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
          >
            📥 Export Tools to CSV
          </button>
          <Link href="/" style={{ color: '#1d4ed8', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
            ← View Public Directory
          </Link>
        </div>
      </header>

      {/* Pending Approval Section */}
      <section style={{ marginBottom: '40px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#b45309', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>🚨 Pending Queue ({pendingTools.length})</span>
        </h2>
        {pendingTools.length === 0 ? (
          <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', border: '1px solid #e2e8f0', color: '#64748b' }}>
            No pending submissions waiting for review.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {pendingTools.map((tool) => (
              <div key={tool.id} style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #fde68a', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#0f172a' }}>{tool.name}</h3>
                    <a href={tool.url} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: '#2563eb', textDecoration: 'none' }}>{tool.url}</a>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      disabled={actionLoading === tool.id}
                      onClick={() => handleApprove(tool)}
                      style={{ backgroundColor: '#059669', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                    >
                      {actionLoading === tool.id ? 'Approving...' : 'Approve & Notify Vendor'}
                    </button>
                    <button
                      disabled={actionLoading === tool.id}
                      onClick={() => handleDelete(tool.id)}
                      style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <p style={{ fontSize: '14px', color: '#334155', margin: '0 0 12px 0', lineHeight: '1.5' }}>{tool.description}</p>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b' }}>
                  <span><strong>Category:</strong> {tool.category}</span>
                  <span><strong>Pricing:</strong> {tool.pricing}</span>
                  <span><strong>Vendor Email:</strong> {tool.submitter_email || 'Not provided'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Approved Directory Section */}
      <section>
        <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#047857', marginBottom: '16px' }}>
          ✅ Approved Listings ({approvedTools.length})
        </h2>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '14px' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
                <th style={{ padding: '12px 16px' }}>Name</th>
                <th style={{ padding: '12px 16px' }}>Category</th>
                <th style={{ padding: '12px 16px' }}>Submitter Email</th>
                <th style={{ padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedTools.map((tool) => (
                <tr key={tool.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '12px 16px', fontWeight: '600', color: '#0f172a' }}>{tool.name}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{tool.category}</td>
                  <td style={{ padding: '12px 16px', color: '#475569' }}>{tool.submitter_email || 'N/A'}</td>
                  <td style={{ padding: '12px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <button
                      disabled={actionLoading === tool.id}
                      onClick={() => handleMoveToPending(tool.id)}
                      style={{ backgroundColor: '#f59e0b', color: '#ffffff', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: '600', cursor: 'pointer', fontSize: '12px' }}
                    >
                      {actionLoading === tool.id ? 'Moving...' : 'Move to Pending'}
                    </button>
                    <button
                      onClick={() => handleDelete(tool.id)}
                      style={{ backgroundColor: 'transparent', color: '#dc2626', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
