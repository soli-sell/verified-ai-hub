import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

export const revalidate = 0;

export default async function ToolDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const paramVal = params.slug;

  // Attempt lookup by slug first, then fallback to id
  let { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', paramVal)
    .single();

  if (!tool) {
    const { data: toolById } = await supabase
      .from('tools')
      .select('*')
      .eq('id', paramVal)
      .single();
    tool = toolById;
  }

  if (!tool) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#e2f1f8', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'system-ui, sans-serif' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1e3a8a', marginBottom: '12px' }}>Tool Detail Not Found</h1>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>The requested tool could not be located in our verified directory.</p>
        <Link href="/" style={{ backgroundColor: '#1d4ed8', color: '#ffffff', padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' }}>
          ← Return to VerifiedAIHub
        </Link>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#e2f1f8', fontFamily: 'system-ui, sans-serif' }}>
      <nav style={{ backgroundColor: '#1d4ed8', padding: '16px 32px' }}>
        <Link href="/" style={{ color: '#ffffff', textDecoration: 'none', fontWeight: '600', fontSize: '14px' }}>
          ← Back to Directory
        </Link>
      </nav>

      <main style={{ maxWidth: '800px', margin: '40px auto', padding: '0 24px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', padding: '32px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#1d4ed8', backgroundColor: '#eff6ff', padding: '6px 14px', borderRadius: '20px' }}>
              {tool.category || 'Healthcare'}
            </span>
            <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '500' }}>
              Pricing: {tool.pricing || 'Contact for pricing'}
            </span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', marginBottom: '16px' }}>{tool.name}</h1>
          <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.6', marginBottom: '24px' }}>{tool.description}</p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '32px', flexWrap: 'wrap' }}>
            {tool.hipaa_compliant && (
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#047857', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '6px' }}>
                HIPAA Compliant
              </span>
            )}
            {tool.soc2_compliant && (
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#047857', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '6px' }}>
                SOC2 Certified
              </span>
            )}
            {tool.fda_cleared && (
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#047857', backgroundColor: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 10px', borderRadius: '6px' }}>
                FDA Cleared
              </span>
            )}
          </div>

          <a
            href={tool.url?.startsWith('http') ? tool.url : `https://${tool.url}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-block', backgroundColor: '#1d4ed8', color: '#ffffff', fontWeight: '600', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}
          >
            Visit Official Website ↗
          </a>
        </div>
      </main>
    </div>
  );
}
