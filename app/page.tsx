import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function HomePage() {
  // Fetch directly bypassing cache
  const { data: tools } = await supabase
    .from('tools')
    .select('*')
    .eq('status', 'approved');

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '24px 32px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>Verified AI Hub</h1>
          <Link href="/submit" style={{ backgroundColor: '#0f766e', color: '#ffffff', textDecoration: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', fontSize: '14px' }}>
            + Submit AI Tool
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 32px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: '#0f172a', marginBottom: '12px' }}>Verified Medical & Life Sciences AI</h2>
          <p style={{ fontSize: '16px', color: '#64748b', maxWidth: '600px', margin: '0 auto' }}>
            Discover compliant, healthcare-ready artificial intelligence tools filtered by HIPAA, SOC 2, and FDA clearances.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {(tools || []).map((tool) => (
            <div key={tool.id} style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '11px', backgroundColor: '#f1f5f9', color: '#475569', padding: '4px 8px', borderRadius: '4px', fontWeight: '600' }}>
                  {tool.category}
                </span>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#0f172a', margin: '12px 0 8px 0' }}>{tool.name}</h3>
                <p style={{ fontSize: '14px', color: '#64748b', lineHeight: '1.5', margin: '0 0 16px 0' }}>
                  {tool.description?.slice(0, 110)}...
                </p>
              </div>

              <div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {tool.hipaa_compliant && <span style={{ fontSize: '11px', backgroundColor: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>HIPAA</span>}
                  {tool.soc2_compliant && <span style={{ fontSize: '11px', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>SOC 2</span>}
                  {tool.fda_cleared && <span style={{ fontSize: '11px', backgroundColor: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '12px', fontWeight: '600' }}>FDA</span>}
                </div>

                <Link
                  href={`/tools/${tool.slug}`}
                  style={{ display: 'block', textAlign: 'center', backgroundColor: '#f8fafc', border: '1px solid #cbd5e1', color: '#0f172a', textDecoration: 'none', padding: '10px', borderRadius: '6px', fontWeight: '600', fontSize: '14px' }}
                >
                  View Details & Verification →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
