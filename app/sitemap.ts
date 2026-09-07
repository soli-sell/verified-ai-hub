import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  "https://knsajxxoarmskzxeatyr.supabase.co",
  "sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS"
);

export const revalidate = 0;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data: tools } = await supabase
    .from('tools')
    .select('*');

  const toolEntries: MetadataRoute.Sitemap = (tools || []).map((tool) => {
    const fallbackSlug = tool.slug || tool.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-') || `tool-${tool.id}`;
    return {
      url: `https://verifiedaihub.com/tools/${fallbackSlug}`,
      lastModified: new Date(tool.updated_at || Date.now()),
      changeFrequency: 'weekly',
      priority: 0.8,
    };
  });

  return [
    {
      url: 'https://verifiedaihub.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: 'https://verifiedaihub.com/submit',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...toolEntries,
  ];
}
