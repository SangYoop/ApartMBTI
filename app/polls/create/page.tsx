"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, MapPin, Wallet } from "lucide-react";
import { getSupabase, Apartment, formatBudget } from "@/lib/supabase";
import ApartmentSearch from "@/components/ApartmentSearch";
import ApartmentSummaryCard from "@/components/ApartmentSummaryCard";

const STEPS = ["제목 작성", "아파트 선택", "등록 확인"];

const REGIONS = ["서울", "경기", "지방광역시", "지방"] as const;
type Region = (typeof REGIONS)[number];

const slideVariants = {
  enter: { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  exit: { opacity: 0, x: -32, transition: { duration: 0.2, ease: [0.55, 0, 1, 0.45] as const } },
};

export default function CreatePollPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [region, setRegion] = useState<Region | null>(null);
  const [budgetInput, setBudgetInput] = useState("");
  const [selected, setSelected] = useState<Apartment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const budget = budgetInput ? parseFloat(budgetInput) : null;
  const step0Valid = title.trim().length >= 5 && region !== null;

  async function handleSubmit() {
    if (selected.length < 2 || !title.trim() || !region) return;
    setSubmitting(true);

    const { data: poll, error } = await getSupabase()
      .from("polls")
      .insert({
        title: title.trim(),
        region,
        budget: budget && !isNaN(budget) ? budget : null,
      })
      .select()
      .single();

    if (error || !poll) {
      setSubmitting(false);
      return;
    }

    await getSupabase().from("poll_options").insert(
      selected.map((apt) => ({
        poll_id: poll.id,
        apartment_id: apt.danjiCode,
        vote_count: 0,
      }))
    );

    router.push(`/polls/${poll.id}`);
  }

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/polls" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <h1 className="font-extrabold text-slate-900 text-lg">아파트 밸런스 게임</h1>
        </div>

        {/* 단계 인디케이터 */}
        <div className="max-w-xl mx-auto px-4 pb-4 flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1 min-w-0">
              <div
                className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                  i < step ? "bg-indigo-600 text-white" : i === step ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span className={["text-xs font-medium truncate", i === step ? "text-indigo-700" : "text-slate-400"].join(" ")}>
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div className={["flex-1 h-0.5 mx-1", i < step ? "bg-indigo-300" : "bg-slate-200"].join(" ")} />
              )}
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 0: 제목 + 지역 + 예산 */}
          {step === 0 && (
            <motion.div key="step0" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">어떤 고민을 나눌까요?</h2>
                <p className="text-slate-500 text-sm">제목·지역·예산을 입력해주세요</p>
              </div>

              {/* 제목 */}
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 현금 2억 + 대출 4억으로 베스트 선택은 어디쯤일까?"
                rows={3}
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-base"
              />

              {/* 지역 선택 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MapPin size={15} className="text-indigo-500" />
                  <p className="text-sm font-bold text-slate-700">지역 선택 <span className="text-red-400">*</span></p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {REGIONS.map((r) => (
                    <button
                      key={r}
                      onClick={() => setRegion(r)}
                      className={[
                        "py-3 rounded-xl border-2 text-sm font-bold transition-colors",
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

              {/* 예상 구매금액 */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Wallet size={15} className="text-indigo-500" />
                  <p className="text-sm font-bold text-slate-700">예상 구매금액 <span className="text-slate-400 font-normal">(선택)</span></p>
                </div>
                <div className="flex items-center gap-3 bg-white border-2 border-slate-200 rounded-2xl px-5 py-3.5 focus-within:border-indigo-500 transition-colors">
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={budgetInput}
                    onChange={(e) => setBudgetInput(e.target.value)}
                    placeholder="예: 6"
                    className="flex-1 bg-transparent outline-none text-slate-800 placeholder:text-slate-400 text-base [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-slate-500 font-semibold shrink-0">억원</span>
                </div>
                {budget !== null && !isNaN(budget) && budget > 0 && (
                  <p className="text-xs text-indigo-500 font-medium mt-1.5 ml-1">
                    → {formatBudget(budget)}
                  </p>
                )}
                <p className="text-xs text-slate-400 mt-1.5 ml-1">1억 미만은 소수로 입력 (예: 0.5 = 5천만원)</p>
              </div>

              <button
                onClick={() => setStep(1)}
                disabled={!step0Valid}
                className="w-full bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 transition-colors"
              >
                다음 단계
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* Step 1: 아파트 검색 */}
          {step === 1 && (
            <motion.div key="step1" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">비교할 아파트를 선택하세요</h2>
                <p className="text-slate-500 text-sm">최소 2개, 최대 4개까지 선택 가능해요</p>
              </div>
              <ApartmentSearch
                selected={selected}
                onAdd={(apt) => setSelected((prev) => [...prev, apt])}
                onRemove={(code) => setSelected((prev) => prev.filter((a) => a.danjiCode !== code))}
                max={4}
              />
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-4 font-bold flex items-center justify-center gap-2">
                  <ArrowLeft size={18} />
                  이전
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={selected.length < 2}
                  className="flex-1 bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  다음
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: 최종 확인 */}
          {step === 2 && (
            <motion.div key="step2" variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">이대로 등록할까요?</h2>
                <p className="text-slate-500 text-sm">등록 후에는 수정이 어려워요</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-3">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider">투표 정보</p>
                <p className="text-slate-900 font-bold">{title}</p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {region && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">
                      <MapPin size={11} />
                      {region}
                    </span>
                  )}
                  {budget && !isNaN(budget) && budget > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                      <Wallet size={11} />
                      {formatBudget(budget)}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">선택된 아파트 ({selected.length}개)</p>
                {selected.map((apt) => (
                  <ApartmentSummaryCard key={apt.danjiCode} apartment={apt} />
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-4 font-bold flex items-center justify-center gap-2">
                  <ArrowLeft size={18} />
                  수정
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 bg-indigo-600 disabled:bg-indigo-400 text-white rounded-2xl py-4 font-bold flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><Check size={18} />등록하기</>
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
