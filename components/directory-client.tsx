'use client';

import React, { useState, useEffect } from 'react';
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

export interface DirectoryClientProps {
  initialTools: AITool[];
}

export function DirectoryClient({ initialTools }: DirectoryClientProps) {
  const [tools, setTools] = useState<AITool[]>(initialTools);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');

  const sectors = ['All', 'Developer Tools', 'Healthcare', 'Life Sciences', 'Finance', 'Legal', 'Education', 'Marketing'];

  useEffect(() => {
    async function fetchLiveTools() {
      let query = supabase.from('tools').select('*');

      if (selectedSector !== 'All') {
        query = query.eq('category', selectedSector);
      }

      const { data, error } = await query;

      if (!error && data) {
        const mappedTools = data.map((tool: any) => {
          let formattedUrl = (tool.url || '').trim();
          if (formattedUrl && !formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
            formattedUrl = `https://${formattedUrl}`;
          }

          return {
            id: String(tool.id),
            name: tool.name,
            slug: tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            website_url: formattedUrl,
            tagline: '',
            description: tool.description,
            sector: tool.category,
            pricing_model: tool.pricing,
            fda_cleared: false,
            hipaa_compliant: false,
            soc2_compliant: false,
            target_audience: 'General Users',
          };
        });
        setTools(mappedTools);
      }
    }

    fetchLiveTools();
  }, [selectedSector]);

  // Keep state updated if initialTools changes on reload
  useEffect(() => {
    setTools(initialTools);
  }, [initialTools]);

  const filteredTools = tools.filter((tool) => {
    const query = search.toLowerCase();
    const matchesSearch =
      tool.name.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query);
    const matchesSector =
      selectedSector === 'All' || tool.sector === selectedSector;
    return matchesSearch && matchesSector;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <input
          type="text"
          placeholder="Search AI tools, categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-96 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {sectors.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSector(sec)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                selectedSector === sec
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No tools found matching your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                      {tool.sector}
                    </span>
                    <h3 className="text-xl font-bold text-white mt-0.5">
                      {tool.name}
                    </h3>
                  </div>
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-medium text-white transition-colors"
                  >
                    Visit Site ↗
                  </a>
                </div>
                
                <p className="text-sm text-slate-300 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 items-center text-xs">
                {tool.hipaa_compliant && (
                  <span className="px-2.5 py-1 rounded-md bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 font-semibold">
                    ✓ HIPAA
                  </span>
                )}
                {tool.soc2_compliant && (
                  <span className="px-2.5 py-1 rounded-md bg-blue-950/80 border border-blue-800/50 text-blue-400 font-semibold">
                    ✓ SOC2
                  </span>
                )}
                {tool.fda_cleared && (
                  <span className="px-2.5 py-1 rounded-md bg-purple-950/80 border border-purple-800/50 text-purple-400 font-semibold">
                    ✓ FDA Cleared
                  </span>
                )}
                <span className="ml-auto text-xs text-slate-400 border border-slate-700 px-2 py-0.5 rounded font-medium">
                  {tool.pricing_model}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DirectoryClient;