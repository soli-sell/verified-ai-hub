'use client';

import { useState, useEffect } from 'react';
import DirectoryClient, { AITool } from '@/components/directory-client';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://knsajxxoarmskzxeatyr.supabase.co';
const supabaseAnonKey = 'sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function cleanUrl(rawUrl: string): string {
  if (!rawUrl) return 'https://claude.ai';
  let str = String(rawUrl).trim();

  const mdMatch = str.match(/\((https?:\/\/[^)]+)\)/);
  if (mdMatch) {
    str = mdMatch[1];
  }

  str = str.replace(/[\[\]"'>\\]/g, '').trim();

  if (!str.startsWith('http://') && !str.startsWith('https://')) {
    str = `https://${str}`;
  }
  return str;
}

export default function HomePage(): JSX.Element {
  const [tools, setTools] = useState<AITool[]>([]);

  useEffect(() => {
    async function loadInitialTools() {
      try {
        const { data, error } = await supabase
          .from('tools')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          const mapped = data.map((tool: any) => ({
            id: String(tool.id),
            name: tool.name,
            slug: tool.name ? tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '',
            website_url: cleanUrl(tool.url),
            tagline: '',
            description: tool.description,
            sector: tool.category,
            pricing_model: tool.pricing,
            fda_cleared: false,
            hipaa_compliant: false,
            soc2_compliant: false,
            target_audience: 'General Users',
          }));
          setTools(mapped);
        }
      } catch (err) {
        console.error('Error fetching tools:', err);
      }
    }

    loadInitialTools();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/90 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.location.href = '/'}>
            <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-lg">
              V
            </div>
            <span className="font-bold text-xl text-white">
              Verified<span className="text-blue-500">AI</span>Hub
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = '/admin';
              }}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white transition-colors cursor-pointer"
            >
              Admin Panel
            </button>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('directory-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
            >
              Explore Index
            </button>
          </div>
        </div>
      </header>

      <section className="pt-20 pb-16 border-b border-slate-800 text-center px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-800/50 text-blue-400 text-xs font-semibold">
            <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Auto-Updated AI Index
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight">
            The Verified Index for <br />
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
              Healthcare, Life Sciences & AI Tools
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Discover and explore verified AI tools across all industry sectors.
          </p>
        </div>
      </section>

      <section id="directory-section" className="py-16 max-w-7xl mx-auto px-4 scroll-mt-20">
        <DirectoryClient initialTools={tools} />
      </section>
    </div>
  );
}