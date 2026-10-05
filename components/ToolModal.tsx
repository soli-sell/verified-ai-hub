import React, { useState } from "react";

interface ToolModalProps {
  tool: {
    name: string;
    category: string;
    description: string;
    websiteUrl?: string;
    compliance?: string[];
    isClaimed?: boolean;
  } | null;
  onClose: () => void;
}

export default function ToolModal({ tool, onClose }: ToolModalProps) {
  const [rating, setRating] = useState("5");
  const [reviewText, setReviewText] = useState("");

  if (!tool) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Category & Visit Website Button */}
        <div className="flex items-center justify-between pr-8">
          <span className="inline-block rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
            {tool.category}
          </span>
          {tool.websiteUrl && (
            <a
              href={tool.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-lg bg-[#0088cc] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0077bb] transition"
            >
              Visit Website ↗
            </a>
          )}
        </div>

        {/* Title */}
        <h2 className="mt-2 text-3xl font-bold text-gray-900">{tool.name}</h2>

        {/* Description */}
        <p className="mt-3 text-gray-600 leading-relaxed">{tool.description}</p>

        {/* Compliance */}
        {tool.compliance && tool.compliance.length > 0 && (
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              PUBLICLY STATED COMPLIANCE CREDENTIALS
            </h4>
            <div className="mt-2 flex flex-wrap gap-2">
              {tool.compliance.map((item, idx) => (
                <span key={idx} className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
                  🛡️ {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Claim Profile Banner */}
        {!tool.isClaimed && (
          <div className="mt-6 rounded-xl border border-purple-200 bg-purple-50/60 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-bold text-purple-900">Are you the owner of {tool.name}?</h4>
              <p className="text-xs text-purple-700 mt-1">
                Claim this profile to obtain a Verified Gold Badge, capture direct leads, and feature your tool.
              </p>
            </div>
            <a
              href="/submit"
              className="shrink-0 rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 transition"
            >
              Claim Profile
            </a>
          </div>
        )}

        <hr className="my-6 border-gray-200" />

        {/* Enterprise Ratings & Reviews */}
        <div>
          <h3 className="text-xl font-bold text-gray-900">Enterprise Ratings & Reviews</h3>

          <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50/50 p-4">
            <h4 className="text-sm font-semibold text-gray-800">Leave a Clinical Review</h4>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-600">Rating:</span>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 shadow-sm"
              >
                <option value="5">⭐⭐⭐⭐⭐ (5/5)</option>
                <option value="4">⭐⭐⭐⭐ (4/5)</option>
                <option value="3">⭐⭐⭐ (3/5)</option>
                <option value="2">⭐⭐ (2/5)</option>
                <option value="1">⭐ (1/5)</option>
              </select>
            </div>

            <textarea
              rows={3}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Describe clinical utility, accuracy, and integration ease..."
              className="mt-3 w-full rounded-lg border border-gray-300 p-2.5 text-xs text-gray-800 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />

            <button className="mt-2 rounded-lg bg-[#0088cc] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#0077bb] transition">
              Submit Review
            </button>
          </div>

          <p className="mt-4 text-xs italic text-gray-500">
            No public reviews approved yet for this tool.
          </p>
        </div>
      </div>
    </div>
  );
}