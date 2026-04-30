"use client";

import { Apartment, RealPrice, formatContractYM, formatAreaSize, formatBudget } from "@/lib/supabase";

function formatYear(d: string | null) {
  if (!d) return "-";
  return d.slice(0, 4) + "년";
}

interface Props {
  apartment: Apartment;
  recentPrice?: RealPrice | null;
  selectedPyeong?: number | null;
  compact?: boolean;
}

export default function ApartmentSummaryCard({ apartment, recentPrice, selectedPyeong, compact = false }: Props) {
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
        <div className="flex flex-wrap gap-1.5 mb-2">
          {danjiType && (
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
              {danjiType}
            </span>
          )}
          {selectedPyeong != null && (
            <span className="text-xs font-bold text-white bg-indigo-500 px-2.5 py-0.5 rounded-full">
              전용 {selectedPyeong}평
            </span>
          )}
        </div>
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

      {recentPrice && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
            최근 실거래
          </span>
          <span className="text-xs text-slate-500">
            {formatContractYM(recentPrice.contract_year_month)}
          </span>
          {recentPrice.area_size != null && (
            <span className="text-xs text-slate-500">
              · {formatAreaSize(recentPrice.area_size)}
            </span>
          )}
          {recentPrice.floor && (
            <span className="text-xs text-slate-500">· {recentPrice.floor}층</span>
          )}
          {recentPrice.price_krw != null && (
            <span className="text-xs font-bold text-slate-700">
              · {formatBudget(recentPrice.price_krw / 10000)}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
