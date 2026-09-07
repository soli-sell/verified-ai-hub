'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://knsajxxoarmskzxeatyr.supabase.co';
const supabaseAnonKey = 'sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface AITool {
  id: string;
  name: string;
  slug: string;
  website_url: string;
  tagline: string;
  description: string;
  sector: string;
  pricing_model: string;
  fda_cleared: boolean;
  hipaa_compliant: boolean;
  soc2_compliant: boolean;
  target_audience: string;
}

interface DirectoryClientProps {
  initialTools: AITool[];
}

const CATEGORIES = [
  'All',
  'Developer Tools',
  'Healthcare',
  'Life Sciences',
  'Finance',
  'Legal',
  'Education',
  'Marketing',
];

const PRICING_OPTIONS = ['All', 'Freemium', 'Free', 'Paid', 'Enterprise'];

export default function DirectoryClient({ initialTools = [] }: DirectoryClientProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedPricing, setSelectedPricing] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [filterHipaa, setFilterHipaa] = useState(false);
  const [filterSoc2, setFilterSoc2] = useState(false);
  const [filterFda, setFilterFda] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    email: '',
    tagline: '',
    sector: 'Healthcare',
    pricing: 'Freemium',
    description: '',
    hipaa: false,
    soc2: false,
    fda: false,
  });

  const filteredTools = (initialTools || []).filter((tool) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (tool.sector && tool.sector.toLowerCase() === selectedCategory.toLowerCase());

    const matchesPricing =
      selectedPricing === 'All' ||
      (tool.pricing_model && tool.pricing_model.toLowerCase() === selectedPricing.toLowerCase());

    const matchesSearch =
      (tool.name && tool.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (tool.description && tool.description.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesHipaa = !filterHipaa || tool.hipaa_compliant;
    const matchesSoc2 = !filterSoc2 || tool.soc2_compliant;
    const matchesFda = !filterFda || tool.fda_cleared;

    return (
      matchesCategory &&
      matchesPricing &&
      matchesSearch &&
      matchesHipaa &&
      matchesSoc2 &&
      matchesFda
    );
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const { error } = await supabase.from('tools').insert([
        {
          name: formData.name,
          url: formData.url,
          category: formData.sector,
          pricing: formData.pricing,
          description: formData.description,
          status: 'pending',
          hipaa_compliant: formData.hipaa,
          soc2_compliant: formData.soc2,
          fda_cleared: formData.fda,
        },
      ]);

      if (error) throw error;

      fetch('/api/notify-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          url: formData.url,
          email: formData.email,
          sector: formData.sector,
          description: formData.description,
        }),
      }).catch((err) => console.error('Alert trigger error:', err));

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
        setFormData({
          name: '',
          url: '',
          email: '',
          tagline: '',
          sector: 'Healthcare',
          pricing: 'Freemium',
          description: '',
          hipaa: false,
          soc2: false,
          fda: false,
        });
      }, 2000);
    } catch (err: any) {
      console.error('Submission error:', err);
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit tool. Please try again.');
    }
  };

  return (
    <div>
      {/* Header */}
      <header style={{ borderBottom: '1px solid #93c5fd', padding: '16px 24px', backgroundColor: '#bfdbfe' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
            <div style={{ width: '32px', height: '32px', backgroundColor: '#1d4ed8', color: '#ffffff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
              V
            </div>
            <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#1e3a8a' }}>
              Verified<span style={{ color: '#2563eb' }}>AI</span>Hub
            </span>
          </Link>

          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: '#1d4ed8',
                color: '#ffffff',
                border: '1px solid #1e40af',
                padding: '8px 18px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              Submit Tool
            </button>
          </div>

        </div>
      </header>

      {/* Hero */}
      <section style={{ paddingTop: '56px', paddingBottom: '40px', borderBottom: '1px solid #93c5fd', textAlign: 'center', paddingLeft: '16px', paddingRight: '16px' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', borderRadius: '9999px', backgroundColor: '#dbeafe', border: '1px solid #bfdbfe', color: '#1d4ed8', fontSize: '12px', fontWeight: '600', marginBottom: '16px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563eb' }} />
            Verified AI Index
          </div>
          <h1 style={{ fontSize: '40px', fontWeight: '800', color: '#1e3a8a', lineHeight: '1.2', margin: '0 0 12px 0' }}>
            Healthcare & Life Sciences <br />
            <span style={{ color: '#1d4ed8' }}>
              Compliance-Verified AI Tools
            </span>
          </h1>
          <p style={{ fontSize: '16px', color: '#334155', maxWidth: '640px', margin: '0 auto' }}>
            Discover enterprise-ready clinical, regulatory, and research AI applications.
          </p>
        </div>
      </section>

      {/* Directory Section */}
      <div id="directory-list" style={{ padding: '36px 16px', maxWidth: '1280px', margin: '0 auto' }}>
        
        {/* Search Bar */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search AI tools by name, description, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 18px',
              backgroundColor: '#ffffff',
              border: '1px solid #93c5fd',
              borderRadius: '10px',
              color: '#0f172a',
              fontSize: '15px',
              outline: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
            }}
          />
        </div>

        {/* Multi-Tag Control Toolbar */}
        <div style={{ backgroundColor: '#ffffff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '16px 20px', marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* Categories */}
          <div>
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
              Industry Sector
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600',
                    border: '1px solid #93c5fd',
                    cursor: 'pointer',
                    backgroundColor: selectedCategory === cat ? '#1d4ed8' : '#f8fafc',
                    color: selectedCategory === cat ? '#ffffff' : '#334155',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
            
            {/* Compliance Filters */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                Compliance Filters
              </span>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setFilterHipaa(!filterHipaa)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid',
                    cursor: 'pointer',
                    backgroundColor: filterHipaa ? '#eff6ff' : '#f8fafc',
                    color: filterHipaa ? '#1d4ed8' : '#64748b',
                    borderColor: filterHipaa ? '#1d4ed8' : '#cbd5e1',
                  }}
                >
                  🔒 HIPAA Ready {filterHipaa && '✓'}
                </button>

                <button
                  onClick={() => setFilterSoc2(!filterSoc2)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid',
                    cursor: 'pointer',
                    backgroundColor: filterSoc2 ? '#eff6ff' : '#f8fafc',
                    color: filterSoc2 ? '#1d4ed8' : '#64748b',
                    borderColor: filterSoc2 ? '#1d4ed8' : '#cbd5e1',
                  }}
                >
                  🛡️ SOC2 Compliant {filterSoc2 && '✓'}
                </button>

                <button
                  onClick={() => setFilterFda(!filterFda)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    border: '1px solid',
                    cursor: 'pointer',
                    backgroundColor: filterFda ? '#dcfce7' : '#f8fafc',
                    color: filterFda ? '#166534' : '#64748b',
                    borderColor: filterFda ? '#166534' : '#cbd5e1',
                  }}
                >
                  ✓ FDA Cleared {filterFda && '✓'}
                </button>
              </div>
            </div>

            {/* Pricing Model Filter */}
            <div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#1e3a8a', display: 'block', marginBottom: '8px', textTransform: 'uppercase' }}>
                Pricing Model
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {PRICING_OPTIONS.map((price) => (
                  <button
                    key={price}
                    onClick={() => setSelectedPricing(price)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '600',
                      border: '1px solid',
                      cursor: 'pointer',
                      backgroundColor: selectedPricing === price ? '#0f172a' : '#f8fafc',
                      color: selectedPricing === price ? '#ffffff' : '#475569',
                      borderColor: selectedPricing === price ? '#0f172a' : '#cbd5e1',
                    }}
                  >
                    {price}
                  </button>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Results Info Bar */}
        <div style={{ marginBottom: '16px', fontSize: '13px', color: '#334155', fontWeight: 'bold' }}>
          Showing {filteredTools.length} verified {filteredTools.length === 1 ? 'tool' : 'tools'}
        </div>

        {/* Directory Cards Grid */}
        {filteredTools.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #bfdbfe', color: '#475569' }}>
            No tools match your current filter combination.
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {filteredTools.map((tool) => (
              <div
                key={tool.id}
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #bfdbfe',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        color: '#1d4ed8',
                        backgroundColor: '#dbeafe',
                        padding: '2px 8px',
                        borderRadius: '4px',
                      }}
                    >
                      {tool.sector || 'AI Tool'}
                    </span>
                    
                    <a
                      href={tool.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        backgroundColor: '#1d4ed8',
                        color: '#ffffff',
                        border: '1px solid #1e40af',
                        padding: '6px 14px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        textDecoration: 'none',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      Visit Site ↗
                    </a>
                  </div>

                  <Link
                    href={`/tool/${tool.slug || tool.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', marginBottom: '8px', cursor: 'pointer' }}>
                      {tool.name} →
                    </h3>
                  </Link>

                  {/* Compliance Badges */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    {tool.hipaa_compliant && (
                      <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px' }}>
                        🔒 HIPAA
                      </span>
                    )}
                    {tool.soc2_compliant && (
                      <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#eff6ff', color: '#1d4ed8', border: '1px solid #bfdbfe', padding: '2px 6px', borderRadius: '4px' }}>
                        🛡️ SOC2
                      </span>
                    )}
                    {tool.fda_cleared && (
                      <span style={{ fontSize: '10px', fontWeight: 'bold', backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 6px', borderRadius: '4px' }}>
                        ✓ FDA Cleared
                      </span>
                    )}
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#334155', lineHeight: '1.5', marginBottom: '16px' }}>
                    {tool.description}
                  </p>
                </div>

                <div style={{ paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                    {tool.pricing_model || 'Freemium'}
                  </span>

                  <Link
                    href={`/tool/${tool.slug || tool.id}`}
                    style={{ fontSize: '12px', color: '#2563eb', fontWeight: 'bold', textDecoration: 'none' }}
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Discreet Footer Link to Admin */}
        <footer style={{ marginTop: '64px', paddingTop: '24px', borderTop: '1px solid #bfdbfe', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
          <span>© 2026 VerifiedAIHub. All rights reserved.</span>
          <span style={{ margin: '0 8px' }}>•</span>
          <a href="/admin" style={{ color: '#64748b', textDecoration: 'none' }}>Admin Access</a>
        </footer>

      </div>

      {/* POP-UP MODAL */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '16px',
          }}
        >
          <div
            style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bfdbfe',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#64748b',
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            <h2 style={{ fontSize: '22px', fontWeight: 'bold', color: '#1e3a8a', marginBottom: '6px' }}>
              Submit an AI Tool
            </h2>
            <p style={{ fontSize: '14px', color: '#475569', marginBottom: '20px' }}>
              Add your application to the directory for review.
            </p>

            {errorMessage && (
              <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
                {errorMessage}
              </div>
            )}

            {submitSuccess ? (
              <div style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac', color: '#166534', padding: '16px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>
                ✓ Tool submitted successfully for admin review!
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a8a', marginBottom: '4px' }}>
                    Tool Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #93c5fd', backgroundColor: '#ffffff', color: '#0f172a' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a8a', marginBottom: '4px' }}>
                      Website URL *
                    </label>
                    <input
                      type="url"
                      required
                      value={formData.url}
                      onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                      placeholder="https://..."
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #93c5fd', backgroundColor: '#ffffff', color: '#0f172a' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a8a', marginBottom: '4px' }}>
                      Contact Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #93c5fd', backgroundColor: '#ffffff', color: '#0f172a' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a8a', marginBottom: '4px' }}>
                      Sector *
                    </label>
                    <select
                      value={formData.sector}
                      onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #93c5fd', backgroundColor: '#ffffff', color: '#0f172a' }}
                    >
                      {CATEGORIES.filter((c) => c !== 'All').map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a8a', marginBottom: '4px' }}>
                      Pricing Model *
                    </label>
                    <select
                      value={formData.pricing}
                      onChange={(e) => setFormData({ ...formData, pricing: e.target.value })}
                      style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #93c5fd', backgroundColor: '#ffffff', color: '#0f172a' }}
                    >
                      <option value="Freemium">Freemium</option>
                      <option value="Free">Free</option>
                      <option value="Paid">Paid</option>
                      <option value="Enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a8a', marginBottom: '6px' }}>
                    Compliance & Security Standards
                  </label>
                  <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', backgroundColor: '#ffffff', padding: '10px', borderRadius: '6px', border: '1px solid #93c5fd' }}>
                    <label style={{ fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.hipaa}
                        onChange={(e) => setFormData({ ...formData, hipaa: e.target.checked })}
                      />
                      HIPAA Ready
                    </label>
                    <label style={{ fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.soc2}
                        onChange={(e) => setFormData({ ...formData, soc2: e.target.checked })}
                      />
                      SOC2 Compliant
                    </label>
                    <label style={{ fontSize: '13px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={formData.fda}
                        onChange={(e) => setFormData({ ...formData, fda: e.target.checked })}
                      />
                      FDA Cleared
                    </label>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#1e3a8a', marginBottom: '4px' }}>
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #93c5fd', backgroundColor: '#ffffff', color: '#0f172a' }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    marginTop: '8px',
                    backgroundColor: '#1d4ed8',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    padding: '12px',
                    borderRadius: '8px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '15px',
                  }}
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Tool'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
