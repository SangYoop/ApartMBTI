"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Check, MapPin, Wallet, Plus, Search, X } from "lucide-react";
import { getSupabase, Apartment, TransactionType, APT_COLS, formatBudget } from "@/lib/supabase";
import ApartmentSummaryCard from "@/components/ApartmentSummaryCard";

const REGIONS = ["서울", "경기", "지방광역시", "지방"] as const;
type Region = (typeof REGIONS)[number];

type SelectedOption = { apartment: Apartment; pyeong: number | null };

/* ── 아파트 검색 바텀시트 모달 ── */
function ApartmentSearchModal({
  selectedIds,
  onAdd,
  onClose,
  max,
  currentCount,
}: {
  selectedIds: Set<string>;
  onAdd: (apt: Apartment) => void;
  onClose: () => void;
  max: number;
  currentCount: number;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const tokens = query.trim().split(/\s+/).filter(Boolean);
        const stripped = tokens.join("");
        const conditions = new Set([
          ...tokens.map((t) => `danjiName.ilike.%${t}%`),
          ...(tokens.length > 1 ? [`danjiName.ilike.%${stripped}%`] : []),
          ...tokens.map((t) => `sigungu.ilike.%${t}%`),
        ]);
        const { data } = await getSupabase()
          .from("apartData")
          .select(APT_COLS)
          .or([...conditions].join(","))
          .limit(20);
        setResults((data as Apartment[]) ?? []);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  function handleSelect(apt: Apartment) {
    if (!selectedIds.has(apt.danjiCode) && currentCount < max) {
      onAdd(apt);
      onClose();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="absolute inset-x-0 bottom-0 bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 bg-slate-200 rounded-full" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">아파트 검색</h2>
            <p className="text-xs text-slate-400 mt-0.5">{currentCount}/{max}개 선택됨 · 선택 시 자동으로 닫혀요</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>
        <div className="px-5 pb-4 shrink-0">
          <div className="flex items-center gap-2 bg-slate-50 border-2 border-slate-200 rounded-2xl px-4 py-3 focus-within:border-indigo-500 transition-colors">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="단지명으로 검색 (예: 래미안, 힐스테이트)"
              className="flex-1 bg-transparent outline-none text-sm text-slate-800 placeholder:text-slate-400"
            />
            {loading ? (
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin shrink-0" />
            ) : query ? (
              <button onClick={() => setQuery("")}>
                <X size={16} className="text-slate-400 hover:text-slate-600" />
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-5 pb-10">
          {query.length < 2 && (
            <p className="text-sm text-slate-400 text-center py-12">단지명을 2자 이상 입력해주세요</p>
          )}
          {query.length >= 2 && !loading && results.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-12">검색 결과가 없습니다</p>
          )}
          <div className="space-y-2">
            {results.map((apt) => {
              const isSelected = selectedIds.has(apt.danjiCode);
              const isFull = currentCount >= max;
              return (
                <button
                  key={apt.danjiCode}
                  onClick={() => handleSelect(apt)}
                  disabled={isSelected || isFull}
                  className={[
                    "w-full text-left px-4 py-3.5 rounded-2xl border-2 transition-colors",
                    isSelected
                      ? "border-indigo-200 bg-indigo-50 cursor-default"
                      : isFull
                      ? "border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed"
                      : "border-slate-100 bg-white hover:border-indigo-300 hover:bg-indigo-50/50 cursor-pointer",
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-bold text-slate-800 truncate">
                      {apt.danjiName}
                      {isSelected && <span className="ml-2 text-xs text-indigo-500 font-medium">추가됨</span>}
                    </p>
                    <p className="text-xs text-slate-400 shrink-0">{apt.sigungu}</p>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{apt.sido}</p>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ── 메인 페이지 ── */
export default function CreatePollPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState<Region | null>(null);
  const [transactionType, setTransactionType] = useState<TransactionType>("매매");
  const [budgetInput, setBudgetInput] = useState("");
  const [selected, setSelected] = useState<SelectedOption[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const MAX_APTS = 4;
  const budget = budgetInput ? parseFloat(budgetInput) : null;

  const selectedIds = new Set(selected.map((s) => s.apartment.danjiCode));

  const allPyeongsSelected = selected.every(
    (s) => !s.apartment.area_types?.length || s.pyeong !== null
  );
  const isValid =
    title.trim().length >= 5 && region !== null && selected.length >= 2 && allPyeongsSelected;

  const validationHint = !isValid
    ? title.trim().length < 5
      ? "제목을 5자 이상 입력해주세요"
      : !region
      ? "지역을 선택해주세요"
      : selected.length < 2
      ? "아파트를 2개 이상 추가해주세요"
      : "모든 아파트의 평형을 선택해주세요"
    : null;

  function handleAddApartment(apt: Apartment) {
    setSelected((prev) => [...prev, { apartment: apt, pyeong: null }]);
  }

  function handleRemoveApartment(danjiCode: string) {
    setSelected((prev) => prev.filter((s) => s.apartment.danjiCode !== danjiCode));
  }

  function handlePyeongSelect(danjiCode: string, pyeong: number) {
    setSelected((prev) =>
      prev.map((s) =>
        s.apartment.danjiCode === danjiCode
          ? { ...s, pyeong: s.pyeong === pyeong ? null : pyeong }
          : s
      )
    );
  }

  async function handleSubmit() {
    if (!isValid || submitting) return;
    setSubmitting(true);

    const { data: poll, error } = await getSupabase()
      .from("polls")
      .insert({
        title: title.trim(),
        region,
        budget: budget && !isNaN(budget) ? budget : null,
        transaction_type: transactionType,
      })
      .select()
      .single();

    if (error || !poll) { setSubmitting(false); return; }

    await getSupabase().from("poll_options").insert(
      selected.map(({ apartment, pyeong }) => ({
        poll_id: poll.id,
        apartment_id: apartment.danjiCode,
        pyeong: pyeong ?? null,
        vote_count: 0,
      }))
    );

    router.push(`/polls/${poll.id}`);
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50 pb-32">
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
          <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
            <Link href="/polls" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
              <ArrowLeft size={18} className="text-slate-500" />
            </Link>
            <h1 className="font-extrabold text-slate-900 text-lg">새 투표 만들기</h1>
          </div>
        </header>

        <div className="max-w-xl mx-auto px-4 py-6 space-y-8">
          {/* 제목 */}
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-700">
              투표 제목 <span className="text-red-400">*</span>
            </p>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예: 현금 2억 + 대출 4억으로 베스트 선택은 어디쯤일까?"
              rows={3}
              className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-base"
            />
            <p className="text-xs text-slate-400 ml-1">{title.trim().length}자 입력됨 (최소 5자)</p>
          </div>

          {/* 지역 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-indigo-500" />
              <p className="text-sm font-bold text-slate-700">
                지역 <span className="text-red-400">*</span>
              </p>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {REGIONS.map((r) => (
                <button
                  key={r}
                  onClick={() => setRegion(r)}
                  className={[
                    "py-3 rounded-xl border-2 text-xs font-bold transition-colors",
                    region === r
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300",
                  ].join(" ")}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* 거래 유형 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Wallet size={15} className="text-indigo-500" />
              <p className="text-sm font-bold text-slate-700">
                거래 유형 <span className="text-red-400">*</span>
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(["매매", "전세"] as TransactionType[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTransactionType(t)}
                  className={[
                    "py-3 rounded-xl border-2 text-sm font-bold transition-colors",
                    transactionType === t
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300",
                  ].join(" ")}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* 예산 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Wallet size={15} className="text-indigo-500" />
              <p className="text-sm font-bold text-slate-700">
                예상 {transactionType === "전세" ? "전세금" : "매매가"}{" "}
                <span className="text-slate-400 font-normal">(선택)</span>
              </p>
            </div>
            <div className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl px-5 py-3.5 focus-within:border-indigo-500 transition-colors">
              <input
                type="number"
                min="0.1"
                step="0.1"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                placeholder={transactionType === "전세" ? "예: 3" : "예: 6"}
                className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <span className="text-slate-500 font-semibold shrink-0">억원</span>
            </div>
            {budget !== null && !isNaN(budget) && budget > 0 && (
              <p className="text-xs text-indigo-500 font-medium ml-1">→ {formatBudget(budget)}</p>
            )}
            <p className="text-xs text-slate-400 ml-1">1억 미만은 소수로 입력 (예: 0.5 = 5천만원)</p>
          </div>

          {/* 비교 아파트 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-slate-700">
                비교 아파트 <span className="text-red-400">*</span>
              </p>
              <p className="text-xs text-slate-400">{selected.length}/{MAX_APTS}개 · 최소 2개</p>
            </div>

            <AnimatePresence>
              {selected.map((item) => (
                <motion.div
                  key={item.apartment.danjiCode}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <div className="relative">
                    <ApartmentSummaryCard apartment={item.apartment} selectedPyeong={item.pyeong} />
                    <button
                      onClick={() => handleRemoveApartment(item.apartment.danjiCode)}
                      className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  {/* 평형 선택 칩 */}
                  {item.apartment.area_types && item.apartment.area_types.length > 0 && (
                    <div className="px-1">
                      <p className="text-xs text-slate-500 mb-2">
                        평형 선택 <span className="text-red-400">*</span>
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {item.apartment.area_types.map((at) => (
                          <button
                            key={at.pyeong}
                            onClick={() => handlePyeongSelect(item.apartment.danjiCode, at.pyeong)}
                            className={[
                              "px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors",
                              item.pyeong === at.pyeong
                                ? "border-indigo-500 bg-indigo-500 text-white"
                                : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300",
                            ].join(" ")}
                          >
                            전용 {at.pyeong}평
                            <span className="ml-1 font-normal opacity-70">{at.households}세대</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>

            {selected.length < MAX_APTS && (
              <button
                onClick={() => setModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/50 text-indigo-600 font-bold text-sm hover:bg-indigo-50 hover:border-indigo-400 transition-colors"
              >
                <Plus size={18} />
                비교할 아파트 추가하기 ({selected.length}/{MAX_APTS})
              </button>
            )}
          </div>
        </div>

        {/* 하단 고정 등록 버튼 */}
        <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-slate-100 px-4 py-4 z-20">
          <div className="max-w-xl mx-auto space-y-2">
            <button
              onClick={handleSubmit}
              disabled={!isValid || submitting}
              className="w-full bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 transition-colors"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Check size={18} />투표 등록하기</>
              )}
            </button>
            {validationHint && (
              <p className="text-xs text-slate-400 text-center">{validationHint}</p>
            )}
          </div>
        </div>
      </main>

      <AnimatePresence>
        {modalOpen && (
          <ApartmentSearchModal
            selectedIds={selectedIds}
            onAdd={handleAddApartment}
            onClose={() => setModalOpen(false)}
            max={MAX_APTS}
            currentCount={selected.length}
          />
        )}
      </AnimatePresence>
    </>
  );
}
