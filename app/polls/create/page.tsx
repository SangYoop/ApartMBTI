"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { supabase, Apartment } from "@/lib/supabase";
import ApartmentSearch from "@/components/ApartmentSearch";
import ApartmentSummaryCard from "@/components/ApartmentSummaryCard";

const STEPS = ["제목 작성", "아파트 선택", "등록 확인"];

const slideVariants = {
  enter: { opacity: 0, x: 32 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  exit: { opacity: 0, x: -32, transition: { duration: 0.2, ease: [0.55, 0, 1, 0.45] as const } },
};

export default function CreatePollPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [selected, setSelected] = useState<Apartment[]>([]);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (selected.length < 2 || !title.trim()) return;
    setSubmitting(true);

    const { data: poll, error } = await supabase
      .from("polls")
      .insert({ title: title.trim() })
      .select()
      .single();

    if (error || !poll) {
      setSubmitting(false);
      return;
    }

    await supabase.from("poll_options").insert(
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
          <Link
            href="/polls"
            className="p-2 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <h1 className="font-extrabold text-slate-900 text-lg">새 투표 만들기</h1>
        </div>

        {/* 단계 인디케이터 */}
        <div className="max-w-xl mx-auto px-4 pb-4 flex items-center gap-1">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1 min-w-0">
              <div
                className={[
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-colors",
                  i < step
                    ? "bg-indigo-600 text-white"
                    : i === step
                    ? "bg-indigo-100 text-indigo-700"
                    : "bg-slate-100 text-slate-400",
                ].join(" ")}
              >
                {i < step ? <Check size={12} /> : i + 1}
              </div>
              <span
                className={[
                  "text-xs font-medium truncate",
                  i === step ? "text-indigo-700" : "text-slate-400",
                ].join(" ")}
              >
                {s}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={[
                    "flex-1 h-0.5 mx-1",
                    i < step ? "bg-indigo-300" : "bg-slate-200",
                  ].join(" ")}
                />
              )}
            </div>
          ))}
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Step 0: 제목 */}
          {step === 0 && (
            <motion.div
              key="step0"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                  어떤 고민을 나눌까요?
                </h2>
                <p className="text-slate-500 text-sm">투표 제목을 입력해주세요</p>
              </div>
              <textarea
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 신혼집 고민중인데 어디가 나을까요?"
                rows={4}
                className="w-full bg-white border-2 border-slate-200 rounded-2xl px-5 py-4 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors resize-none text-base"
              />
              <button
                onClick={() => setStep(1)}
                disabled={title.trim().length < 5}
                className="w-full bg-indigo-600 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-2xl py-4 font-bold text-base flex items-center justify-center gap-2 transition-colors"
              >
                다음 단계
                <ArrowRight size={18} />
              </button>
            </motion.div>
          )}

          {/* Step 1: 아파트 검색 */}
          {step === 1 && (
            <motion.div
              key="step1"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                  비교할 아파트를 선택하세요
                </h2>
                <p className="text-slate-500 text-sm">
                  최소 2개, 최대 4개까지 선택 가능해요
                </p>
              </div>
              <ApartmentSearch
                selected={selected}
                onAdd={(apt) => setSelected((prev) => [...prev, apt])}
                onRemove={(code) =>
                  setSelected((prev) => prev.filter((a) => a.danjiCode !== code))
                }
                max={4}
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setStep(0)}
                  className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-4 font-bold flex items-center justify-center gap-2"
                >
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
            <motion.div
              key="step2"
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">
                  이대로 등록할까요?
                </h2>
                <p className="text-slate-500 text-sm">등록 후에는 수정이 어려워요</p>
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">
                  투표 제목
                </p>
                <p className="text-slate-900 font-bold">{title}</p>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  선택된 아파트 ({selected.length}개)
                </p>
                {selected.map((apt) => (
                  <ApartmentSummaryCard key={apt.danjiCode} apartment={apt} />
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-100 text-slate-700 rounded-2xl py-4 font-bold flex items-center justify-center gap-2"
                >
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
                    <>
                      <Check size={18} />
                      등록하기
                    </>
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
