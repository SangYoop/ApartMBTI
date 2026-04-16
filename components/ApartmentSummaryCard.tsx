"use client";

import { Apartment } from "@/lib/supabase";

function formatYear(d: string | null) {
  if (!d) return "-";
  return d.slice(0, 4) + "년";
}

interface Props {
  apartment: Apartment;
  compact?: boolean;
}

export default function ApartmentSummaryCard({ apartment, compact = false }: Props) {
  const { danjiName, sido, sigungu, sedaeSu, openDay, parkingLots_ratio, danjiType } = apartment;

  if (compact) {
    return (
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
        <p className="text-sm font-bold text-slate-800 truncate">{danjiName}</p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{sigungu}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5">
      <div className="mb-4">
        {danjiType && (
          <span className="inline-block text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-2">
            {danjiType}
          </span>
        )}
        <p className="font-extrabold text-slate-900 text-lg leading-tight truncate">{danjiName}</p>
        <p className="text-sm text-slate-500 mt-1">{sido} {sigungu}</p>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">준공</p>
          <p className="text-sm font-bold text-slate-700">{formatYear(openDay)}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">세대수</p>
          <p className="text-sm font-bold text-slate-700">
            {sedaeSu ? sedaeSu.toLocaleString() : "-"}
          </p>
        </div>
        <div className="bg-slate-50 rounded-xl p-3 text-center">
          <p className="text-xs text-slate-400 mb-1">주차비율</p>
          <p className="text-sm font-bold text-slate-700">
            {parkingLots_ratio ? `${parkingLots_ratio}대` : "-"}
          </p>
        </div>
      </div>
    </div>
  );
}
