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
  const [tools, setTools] = useState<AITool[]>(initialTools || []);
  const [search, setSearch] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');

  const sectors = ['All', 'Developer Tools', 'Healthcare', 'Life Sciences', 'Finance', 'Legal', 'Education', 'Marketing'];

  // Normalizes URLs so they always open correctly in a new tab
  const formatUrl = (rawUrl: string) => {
    if (!rawUrl) return '#';
    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }
    return url;
  };

  useEffect(() => {
    async function fetchLiveTools() {
      let query = supabase.from('tools').select('*');

      if (selectedSector !== 'All') {
        query = query.eq('category', selectedSector);
      }

      const { data, error } = await query;

      if (!error && data) {
        const mapped = data.map((tool: any) => ({
          id: String(tool.id),
          name: tool.name,
          slug: tool.name ? tool.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') : '',
          website_url: formatUrl(tool.url || tool.website_url),
          tagline: '',
          description: tool.description,
          sector: tool.category || tool.sector,
          pricing_model: tool.pricing || tool.pricing_model,
          fda_cleared: false,
          hipaa_compliant: false,
          soc2_compliant: false,
          target_audience: 'General Users',
        }));
        setTools(mapped);
      }
    }

    fetchLiveTools();
  }, [selectedSector]);

  useEffect(() => {
    if (initialTools && initialTools.length > 0) {
      setTools(
        initialTools.map((t) => ({
          ...t,
          website_url: formatUrl(t.website_url),
        }))
      );
    }
  }, [initialTools]);

  const filteredTools = tools.filter((tool) => {
    const query = search.toLowerCase();
    const matchesSearch =
      (tool.name && tool.name.toLowerCase().includes(query)) ||
      (tool.description && tool.description.toLowerCase().includes(query));
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

                  {/* Bright Blue Visit Site Button */}
                  <a
                    href={tool.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer shrink-0"
                  >
                    Visit Site ↗
                  </a>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  {tool.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 items-center text-xs">
                <span className="text-xs text-slate-400 border border-slate-700 px-2.5 py-1 rounded-lg font-medium">
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