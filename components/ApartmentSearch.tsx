"use client";

import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { getSupabase, Apartment, APT_COLS } from "@/lib/supabase";
import ApartmentSummaryCard from "./ApartmentSummaryCard";

interface Props {
  selected: Apartment[];
  onAdd: (apt: Apartment) => void;
  onRemove: (danjiCode: string) => void;
  max?: number;
}

export default function ApartmentSearch({ selected, onAdd, onRemove, max = 4 }: Props) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectedIds = new Set(selected.map((a) => a.danjiCode));

  // 디바운스 검색
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        // 토큰 분리: "래미안 송파" → ["래미안", "송파"]
        const tokens = query.trim().split(/\s+/).filter(Boolean);
        // 공백 제거 버전: "힐스테이트 에코" → "힐스테이트에코" (DB 표기 차이 대응)
        const stripped = tokens.join("");

        const conditions = new Set([
          ...tokens.map((t) => `danjiName.ilike.%${t}%`),
          // 공백 제거 버전 추가 (단어가 여러 개일 때만)
          ...(tokens.length > 1 ? [`danjiName.ilike.%${stripped}%`] : []),
          // sigungu 검색 지원: "송파 래미안" 에서 "송파"로 지역 필터링
          ...tokens.map((t) => `sigungu.ilike.%${t}%`),
        ]);

        const { data } = await getSupabase()
          .from("apartData")
          .select(APT_COLS)
          .or([...conditions].join(","))
          .limit(20);
        setResults((data as Apartment[]) ?? []);
        setOpen(true);
      } catch (e) {
        console.error("[Search] exception:", e);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="space-y-4">
      {/* 검색 인풋 */}
      <div ref={wrapRef} className="relative">
        <div
          className={[
            "flex items-center gap-2 bg-white border-2 rounded-2xl px-4 py-3 transition-colors",
            open ? "border-indigo-500" : "border-slate-200 focus-within:border-indigo-500",
          ].join(" ")}
        >
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              selected.length >= max
                ? `최대 ${max}개 선택 완료`
                : "단지명으로 검색 (예: 래미안, 힐스테이트)"
            }
            disabled={selected.length >= max}
            className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
          {loading && (
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
          )}
        </div>

        {/* 드롭다운 결과 */}
        {open && results.length > 0 && (
          <div className="absolute z-50 w-full mt-2 bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden max-h-64 overflow-y-auto">
            {results.map((apt) => {
              const isSelected = selectedIds.has(apt.danjiCode);
              return (
                <button
                  key={apt.danjiCode}
                  onClick={() => {
                    if (!isSelected && selected.length < max) {
                      onAdd(apt);
                      setQuery("");
                      setOpen(false);
                    }
                  }}
                  disabled={isSelected || selected.length >= max}
                  className={[
                    "w-full text-left px-4 py-3 border-b border-slate-50 last:border-0 transition-colors",
                    isSelected
                      ? "bg-indigo-50 cursor-default"
                      : "hover:bg-slate-50 cursor-pointer",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {apt.danjiName}
                      {isSelected && (
                        <span className="ml-2 text-xs text-indigo-500 font-medium">추가됨</span>
                      )}
                    </p>
                    <p className="text-xs text-slate-400 shrink-0">
                      {apt.sido} {apt.eupMyeon ?? apt.donglee ?? apt.sigungu}
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{apt.sigungu}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 선택된 아파트 목록 */}
      {selected.map((apt) => (
        <div key={apt.danjiCode} className="relative">
          <ApartmentSummaryCard apartment={apt} />
          <button
            onClick={() => onRemove(apt.danjiCode)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      <p className="text-xs text-slate-400 text-center">
        {selected.length}/{max}개 선택됨 · 최소 2개 이상 필요
      </p>
    </div>
  );
}
