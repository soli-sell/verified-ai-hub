import { createClient } from '@supabase/supabase-js';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!tool) {
    return { title: 'Tool Not Found | Verified AI Hub' };
  }

  return {
    title: `${tool.name} - Compliance & Overview | Verified AI Hub`,
    description: tool.description,
    openGraph: {
      title: `${tool.name} | Verified AI Hub`,
      description: tool.description,
      url: `https://verifiedaihub.com/tools/${tool.slug}`,
      siteName: 'Verified AI Hub',
      type: 'website',
    },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;

  const { data: tool } = await supabase
    .from('tools')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!tool) {
    notFound();
  }

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: tool.category,
    url: tool.url,
    offers: {
      '@type': 'Offer',
      price: tool.pricing === 'Free' ? '0' : 'Varies',
      priceCurrency: 'USD',
    },
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header style={{ borderBottom: '1px solid #e2e8f0', backgroundColor: '#ffffff', padding: '20px 32px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ color: '#0f766e', textDecoration: 'none', fontWeight: '700', fontSize: '18px' }}>
            ← Back to Directory
          </Link>
          <span style={{ fontSize: '13px', color: '#64748b' }}>Verified AI Hub</span>
        </div>
      </header>

      <main style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 32px' }}>
        <div style={{ backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <span style={{ fontSize: '12px', backgroundColor: '#f1f5f9', padding: '4px 10px', borderRadius: '4px', color: '#475569', fontWeight: '600' }}>
                {tool.category}
              </span>
              <h1 style={{ fontSize: '32px', fontWeight: '800', color: '#0f172a', margin: '12px 0 8px 0' }}>{tool.name}</h1>
            </div>
            <a
              href={tool.url}
              target="_blank"
              rel="noreferrer"
              style={{ backgroundColor: '#1d4ed8', color: '#ffffff', textDecoration: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', fontSize: '15px' }}
            >
              Visit Official Website ↗
            </a>
          </div>

          <p style={{ fontSize: '16px', color: '#334155', lineHeight: '1.7', margin: '24px 0' }}>{tool.description}</p>

          <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '32px 0' }} />

          <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#0f172a', marginBottom: '16px' }}>Compliance Verification</h2>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {tool.hipaa_compliant ? (
              <span style={{ fontSize: '13px', backgroundColor: '#dcfce7', color: '#166534', padding: '6px 14px', borderRadius: '20px', fontWeight: '600' }}>✓ HIPAA Compliant</span>
            ) : (
              <span style={{ fontSize: '13px', backgroundColor: '#f1f5f9', color: '#94a3b8', padding: '6px 14px', borderRadius: '20px' }}>HIPAA Not Specified</span>
            )}
            
            {tool.soc2_compliant ? (
              <span style={{ fontSize: '13px', backgroundColor: '#e0e7ff', color: '#3730a3', padding: '6px 14px', borderRadius: '20px', fontWeight: '600' }}>✓ SOC 2 Certified</span>
            ) : (
              <span style={{ fontSize: '13px', backgroundColor: '#f1f5f9', color: '#94a3b8', padding: '6px 14px', borderRadius: '20px' }}>SOC 2 Not Specified</span>
            )}

            {tool.fda_cleared ? (
              <span style={{ fontSize: '13px', backgroundColor: '#fef3c7', color: '#92400e', padding: '6px 14px', borderRadius: '20px', fontWeight: '600' }}>✓ FDA Cleared</span>
            ) : (
              <span style={{ fontSize: '13px', backgroundColor: '#f1f5f9', color: '#94a3b8', padding: '6px 14px', borderRadius: '20px' }}>FDA Not Specified</span>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
