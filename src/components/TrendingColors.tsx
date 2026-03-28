"use client";

import { useState, useEffect } from "react";

interface TrendingColor {
  name: string;
  hex: string;
  vibe: string;
  source: string;
  resin_tip: string;
  trending_score: number | null;
}

interface TrendingData {
  month: string;
  data_source: string;
  colors: TrendingColor[];
}

export default function TrendingColors() {
  const [data, setData] = useState<TrendingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selected, setSelected] = useState<TrendingColor | null>(null);

  useEffect(() => {
    fetch("/trending-colors.json")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, []);

  const isFallback = data?.data_source?.includes("fallback");

  if (loading) {
    return (
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
        <div className="h-5 w-44 bg-gray-100 rounded-lg animate-pulse mb-4" />
        <div className="grid grid-cols-4 gap-2">
          {Array(7).fill(0).map((_, i) => (
            <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) return null;

  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">

      {/* Header */}
      <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-gray-100">
        <h2 className="font-semibold text-lg">🎨 Couleurs du moment</h2>
        <span className="text-xs text-gray-400 uppercase tracking-widest">
          {data.month}
        </span>
      </div>

      {/* Swatches */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {data.colors.map((color) => (
          <button
            key={color.hex}
            onClick={() => setSelected(selected?.hex === color.hex ? null : color)}
            className="relative rounded-xl overflow-hidden transition-all duration-150 hover:-translate-y-0.5"
            style={{
              outline: selected?.hex === color.hex ? `2px solid ${color.hex}` : "2px solid transparent",
              outlineOffset: "2px",
            }}
            title={color.name}
          >
            <div className="h-12 w-full" style={{ backgroundColor: color.hex }} />
            {color.trending_score != null && (
              <span className="absolute top-1 right-1 bg-black/25 text-white text-[8px] font-semibold px-1 py-0.5 rounded-full leading-none">
                {color.trending_score}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Info panel — apparaît au clic */}
      {selected && (
        <div className="rounded-xl bg-[#F8F5F2] p-4 border border-gray-100 mb-3">
          <div className="flex items-center gap-3 mb-3">
            <div
              className="w-10 h-10 rounded-lg flex-shrink-0 border border-gray-200"
              style={{ backgroundColor: selected.hex }}
            />
            <div>
              <p className="font-semibold text-sm text-gray-800">{selected.name}</p>
              <p className="text-[11px] font-mono text-gray-400">{selected.hex}</p>
            </div>
            {selected.trending_score != null && (
              <div className="ml-auto text-center">
                <p className="text-lg font-bold text-[#C08457]">{selected.trending_score}</p>
                <p className="text-[9px] text-gray-400 uppercase tracking-wide">score</p>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-700">Vibe · </span>{selected.vibe}
          </p>
          <p className="text-xs text-gray-500 mb-1">
            <span className="font-medium text-gray-700">Source · </span>{selected.source}
          </p>
          <p className="text-xs text-gray-500 italic">
            💡 {selected.resin_tip}
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1.5">
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isFallback ? "bg-orange-400" : "bg-green-400"}`} />
        <p className="text-[10px] text-gray-300">
          Mis à jour le 1er de chaque mois · {isFallback ? "Données de référence" : "Google Trends"} · Pantone · Pinterest
        </p>
      </div>
    </div>
  );
}
