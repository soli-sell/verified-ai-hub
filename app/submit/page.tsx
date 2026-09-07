'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

export default function SubmitToolPage() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    url: '',
    submitter_email: '',
    category: 'Healthcare',
    pricing: 'Enterprise',
    hipaa_compliant: false,
    soc2_compliant: false,
    fda_cleared: false,
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const cleanUrl = (rawUrl: string) => {
    let url = rawUrl.trim();
    const markdownMatch = url.match(/\((https?:\/\/[^\s)]+)\)/);
    if (markdownMatch) {
      url = markdownMatch[1];
    }
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const sanitizedUrl = cleanUrl(formData.url);
    const payload = { ...formData, url: sanitizedUrl, status: 'pending' };

    // 1. Save to Supabase
    const { error: dbError } = await supabase.from('tools').insert([payload]);

    if (dbError) {
      alert('Database error: ' + dbError.message);
      setLoading(false);
      return;
    }

    // 2. Trigger Email Endpoints (Admin Notification + Submitter Receipt)
    try {
      const res = await fetch('/api/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await res.json();

      if (!res.ok) {
        console.error('Notification Error:', resData);
      }
    } catch (err: any) {
      console.error('Failed to trigger email service:', err);
    }

    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#e2f1f8', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ backgroundColor: '#1d4ed8', padding: '16px 32px' }}>
        <Link href="/" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: '600' }}>
          ← Back to Directory
        </Link>
      </nav>

      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#1e3a8a', color: '#ffffff', padding: '24px', borderRadius: '12px', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', marginTop: 0 }}>Verified Listing Guidelines</h2>
          <p style={{ fontSize: '13px', color: '#cbd5e1', margin: '8px 0 16px 0', lineHeight: '1.5' }}>
            To maintain our high credibility standards, all submissions are manually reviewed before going live.
          </p>
          <ul style={{ fontSize: '13px', color: '#e2e8f0', margin: 0, paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Must belong strictly to Healthcare, Life Sciences, Biotech, Pharma, or Diagnostics.</li>
            <li>Regulatory badges (HIPAA, SOC2, FDA) must be verifiable via public documentation.</li>
            <li>Generic AI tools without medical adaptation will be rejected.</li>
          </ul>
        </div>

        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          {submitted ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <h2 style={{ color: '#047857', fontSize: '24px', fontWeight: '800' }}>Submission Received!</h2>
              <p style={{ color: '#475569', margin: '12px 0 24px 0' }}>
                Your tool has been submitted to the moderation queue. A confirmation receipt has been sent to your email address.
              </p>
              <button
                onClick={() => { setSubmitted(false); setFormData({ name: '', description: '', url: '', submitter_email: '', category: 'Healthcare', pricing: 'Enterprise', hipaa_compliant: false, soc2_compliant: false, fda_cleared: false }); }}
                style={{ backgroundColor: '#1d4ed8', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' }}
              >
                Submit Another Tool
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '24px' }}>Submit an AI Solution</h1>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Tool / Model Name *</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} placeholder="e.g. DeepHealth AI" />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Official Website URL *</label>
                <input required type="text" value={formData.url} onChange={(e) => setFormData({ ...formData, url: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} placeholder="https://www.deephealth.com" />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Your Contact / Vendor Email *</label>
                <input required type="email" value={formData.submitter_email} onChange={(e) => setFormData({ ...formData, submitter_email: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} placeholder="contact@company.com" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Category *</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Life Sciences">Life Sciences</option>
                    <option value="Biotech">Biotech</option>
                    <option value="Pharma">Pharma</option>
                    <option value="Diagnostics">Diagnostics</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Pricing Model *</label>
                  <select value={formData.pricing} onChange={(e) => setFormData({ ...formData, pricing: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Freemium">Freemium</option>
                    <option value="Open Source">Open Source</option>
                    <option value="Free Research">Free Research</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '6px' }}>Description *</label>
                <textarea required rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }} placeholder="Briefly describe the clinical or scientific capability..." />
              </div>

              <div style={{ marginBottom: '28px', backgroundColor: '#f8fafc', padding: '16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#334155', marginBottom: '12px' }}>Verified Standards & Compliance Badges</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <label style={{ fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} checked={formData.hipaa_compliant} onChange={(e) => setFormData({ ...formData, hipaa_compliant: e.target.checked })} /> 
                    <span><strong>HIPAA Compliant</strong> (Health Insurance Portability and Accountability Act)</span>
                  </label>
                  <label style={{ fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} checked={formData.soc2_compliant} onChange={(e) => setFormData({ ...formData, soc2_compliant: e.target.checked })} /> 
                    <span><strong>SOC 2 Certified</strong> (Service Organization Control 2 Type II)</span>
                  </label>
                  <label style={{ fontSize: '14px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: '18px', height: '18px', cursor: 'pointer' }} checked={formData.fda_cleared} onChange={(e) => setFormData({ ...formData, fda_cleared: e.target.checked })} /> 
                    <span><strong>FDA Cleared</strong> (510(k) or De Novo Medical Device Clearance)</span>
                  </label>
                </div>
              </div>

              <button disabled={loading} type="submit" style={{ backgroundColor: '#1d4ed8', color: '#ffffff', width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: '700', fontSize: '15px', cursor: 'pointer' }}>
                {loading ? 'Submitting...' : 'Submit Tool for Review'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
