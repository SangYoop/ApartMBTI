"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, X, ChevronRight, Calculator } from "lucide-react";

type Region = "regulated" | "unregulated";
type CalcStep = 1 | 2 | 3 | "result";
type Bottleneck = "dsr" | "ltv" | "cap";

interface CalcResult {
  total: number;
  loan: number;
  monthlyPayment: number;
  ltv: number;
  dsrMaxLoan: number;
  bottleneck: Bottleneck;
  capLimit: number | null;
  dsrPct: number;
}

function calcAffordable(cashMan: number, incomeMan: number, region: Region): CalcResult {
  const isRegulated = region === "regulated";
  const rate = isRegulated ? 0.075 : 0.045;
  const ltv = isRegulated ? 0.4 : 0.7;
  const af = (1 - Math.pow(1 + rate / 12, -480)) / (rate / 12);

  const dsrMaxLoan = Math.floor(((incomeMan * 0.4) / 12) * af / 100) * 100;
  const pFirst = cashMan + dsrMaxLoan;
  const ltvMaxLoan = Math.floor(pFirst * ltv / 100) * 100;
  const uncappedLoan = Math.min(dsrMaxLoan, ltvMaxLoan);

  if (!isRegulated) {
    const loan = uncappedLoan;
    const total = cashMan + loan;
    const monthlyPayment = loan > 0 ? loan / af : 0;
    const dsrPct = incomeMan > 0 ? Math.round(monthlyPayment * 12 / incomeMan * 1000) / 10 : 0;
    const bottleneck: Bottleneck = ltvMaxLoan < dsrMaxLoan ? "ltv" : "dsr";
    return { total, loan, monthlyPayment, ltv, dsrMaxLoan, bottleneck, capLimit: null, dsrPct };
  }

  const brackets = [
    { cap: 60_000, lo: 0,       hi: 150_000 },
    { cap: 40_000, lo: 150_001, hi: 250_000 },
    { cap: 20_000, lo: 250_001, hi: Infinity },
  ];

  let bestLoan = 0, bestTotal = cashMan, bestCap: number | null = null;
  for (const { cap, lo, hi } of brackets) {
    const loan = Math.min(uncappedLoan, cap);
    const total = cashMan + loan;
    if (total >= lo && total <= hi && total > bestTotal) {
      bestLoan = loan;
      bestTotal = total;
      bestCap = cap;
    }
  }

  const loan = bestLoan;
  const total = bestTotal;
  const monthlyPayment = loan > 0 ? loan / af : 0;
  const dsrPct = incomeMan > 0 ? Math.round(monthlyPayment * 12 / incomeMan * 1000) / 10 : 0;
  const capApplied = bestCap !== null && uncappedLoan > bestCap;
  let bottleneck: Bottleneck = "dsr";
  if (capApplied) bottleneck = "cap";
  else if (ltvMaxLoan < dsrMaxLoan) bottleneck = "ltv";

  return { total, loan, monthlyPayment, ltv, dsrMaxLoan, bottleneck, capLimit: capApplied ? bestCap : null, dsrPct };
}

export function formatManwon(manwon: number): string {
  const rounded = Math.round(manwon / 100) * 100;
  const eok = Math.floor(rounded / 10000);
  const man = rounded % 10000;
  if (eok === 0) return `${man.toLocaleString()}만원`;
  if (man === 0) return `${eok.toLocaleString()}억원`;
  return `${eok.toLocaleString()}억 ${man.toLocaleString()}만원`;
}

const stepVariants = {
  enter: { opacity: 0, x: 30 },
  center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } },
  exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
};

export default function MortgageCalculator({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<CalcStep>(1);
  const [region, setRegion] = useState<Region>("regulated");
  const [cash, setCash] = useState("");
  const [income, setIncome] = useState("");

  function reset() {
    setStep(1);
    setRegion("regulated");
    setCash("");
    setIncome("");
  }

  function handleClose() {
    onClose();
    setTimeout(reset, 400);
  }

  const cashNum = parseFloat(cash.replace(/,/g, "")) || 0;
  const incomeNum = parseFloat(income.replace(/,/g, "")) || 0;
  const result = step === "result" ? calcAffordable(cashNum, incomeNum, region) : null;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320, mass: 0.9 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] max-h-[92vh] flex flex-col"
          >
            <div className="flex justify-center pt-4 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            <div className="flex items-center justify-between px-8 pb-6 pt-2 shrink-0">
              <div>
                <p className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-1">
                  내집마련 계산기
                </p>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {step === "result" ? "계산 결과" : `Step ${step} / 3`}
                </h2>
              </div>
              <button
                onClick={handleClose}
                className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X size={18} className="text-slate-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-10">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div key="step1" variants={stepVariants} initial="enter" animate="center" exit="exit">
                    <p className="text-slate-500 text-base font-medium mb-8">
                      매수하려는 주택의 규제 여부를 선택해 주세요.
                      <br />
                      <span className="text-slate-400 text-sm">금리·LTV·대출 한도가 모두 달라집니다.</span>
                    </p>
                    <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-4">
                      {(["regulated", "unregulated"] as Region[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRegion(r)}
                          className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer leading-tight ${
                            region === r ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <span className="block">{r === "regulated" ? "🏙️ 규제지역" : "🌿 비규제지역"}</span>
                          <span className="block text-[11px] font-medium mt-0.5 opacity-60">
                            {r === "regulated" ? "서울 전역 및 경기 12곳" : "기타 경기·지방"}
                          </span>
                        </button>
                      ))}
                    </div>
                    <div className="bg-indigo-50 rounded-2xl px-5 py-4 mb-10">
                      {region === "regulated" ? (
                        <>
                          <p className="text-sm font-semibold text-indigo-600 mb-1">
                            🔒 스트레스 DSR 3% 가산 → 적용 금리 연 7.5% · LTV 40%
                          </p>
                          <p className="text-xs text-indigo-400 font-medium">
                            대출 한도 절벽: 15억 이하 6억 / 15~25억 4억 / 25억 초과 2억
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-semibold text-indigo-600">
                          ✅ 기본 금리 연 4.5% · LTV 70% · 구간 한도 없음
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => setStep(2)}
                      className="w-full bg-indigo-600 text-white rounded-2xl py-5 text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-700 transition-colors"
                    >
                      다음 <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="enter" animate="center" exit="exit">
                    <p className="text-slate-500 text-base font-medium mb-8">
                      현재 보유하고 계신 현금(전세보증금·청약저축 포함)을 입력해 주세요.
                    </p>
                    <div className="relative mb-4">
                      <input
                        type="number"
                        value={cash}
                        onChange={(e) => setCash(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-5 text-2xl font-bold text-slate-900 focus:border-indigo-400 focus:outline-none transition-colors pr-20"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">만원</span>
                    </div>
                    {cash ? (
                      <p className="text-sm text-indigo-500 font-semibold mb-8 px-1">= {formatManwon(parseFloat(cash) || 0)}</p>
                    ) : (
                      <div className="mb-8" />
                    )}
                    <button
                      onClick={() => cashNum > 0 && setStep(3)}
                      disabled={cashNum <= 0}
                      className="w-full bg-indigo-600 text-white rounded-2xl py-5 text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      다음 <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="enter" animate="center" exit="exit">
                    <p className="text-slate-500 text-base font-medium mb-8">
                      부부 합산 연 소득을 입력해 주세요.
                      <br />
                      <span className="text-slate-400 text-sm">
                        DSR 40% · {region === "regulated" ? "스트레스 금리 7.5% (가산 3%)" : "금리 4.5%"} · 40년 만기 기준
                      </span>
                    </p>
                    <div className="relative mb-4">
                      <input
                        type="number"
                        value={income}
                        onChange={(e) => setIncome(e.target.value)}
                        placeholder="0"
                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-2xl px-6 py-5 text-2xl font-bold text-slate-900 focus:border-indigo-400 focus:outline-none transition-colors pr-20"
                      />
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">만원</span>
                    </div>
                    {income ? (
                      <p className="text-sm text-indigo-500 font-semibold mb-8 px-1">= {formatManwon(parseFloat(income) || 0)} / 연</p>
                    ) : (
                      <div className="mb-8" />
                    )}
                    <button
                      onClick={() => incomeNum > 0 && setStep("result")}
                      disabled={incomeNum <= 0}
                      className="w-full bg-indigo-600 text-white rounded-2xl py-5 text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      계산하기 <Calculator size={18} />
                    </button>
                  </motion.div>
                )}

                {step === "result" && result && (
                  <motion.div key="result" variants={stepVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                    <div className="rounded-[2rem] px-8 py-10 text-center" style={{ backgroundColor: "#4f46e5" }}>
                      <p className="text-indigo-300 text-xs font-bold tracking-widest uppercase mb-4">최대 매수 가능 금액</p>
                      <p className="text-white text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                        {formatManwon(result.total)}
                      </p>
                    </div>

                    <div className="bg-indigo-50 rounded-2xl px-7 py-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-1">매월 예상 상환액</p>
                        <p className="text-2xl font-extrabold text-indigo-600 tracking-tight">
                          월 {formatManwon(result.monthlyPayment)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-white text-indigo-500 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-100">
                          DSR {result.dsrPct}%
                        </span>
                        <p className="text-xs text-indigo-300 font-medium mt-1.5">원금 + 이자 균등 납부</p>
                      </div>
                    </div>

                    <div className={`rounded-2xl px-6 py-4 border ${
                      result.bottleneck === "cap" ? "bg-red-50 border-red-200"
                      : result.bottleneck === "ltv" ? "bg-orange-50 border-orange-200"
                      : "bg-yellow-50 border-yellow-200"
                    }`}>
                      <p className={`text-xs font-bold tracking-wide mb-1.5 ${
                        result.bottleneck === "cap" ? "text-red-600"
                        : result.bottleneck === "ltv" ? "text-orange-600"
                        : "text-yellow-700"
                      }`}>
                        {result.bottleneck === "cap" && `⚠️ ${result.capLimit === 60_000 ? "15억 이하" : result.capLimit === 40_000 ? "15억 초과" : "25억 초과"} 한도(${result.capLimit ? formatManwon(result.capLimit) : ""}) 규제 적용됨`}
                        {result.bottleneck === "ltv" && `⚠️ LTV ${Math.round(result.ltv * 100)}% 한도 규제 적용됨`}
                        {result.bottleneck === "dsr" && `⚠️ 스트레스 DSR ${region === "regulated" ? "3.0%" : ""} 적용됨`}
                      </p>
                      <p className={`text-xs font-medium leading-relaxed ${
                        result.bottleneck === "cap" ? "text-red-700"
                        : result.bottleneck === "ltv" ? "text-orange-700"
                        : "text-yellow-800"
                      }`}>
                        {result.bottleneck === "cap" && `10.15 대책 대출 절벽 구간입니다. DSR 기준으론 ${formatManwon(result.dsrMaxLoan)} 대출이 가능하지만, 주택가격 구간별 한도 ${result.capLimit ? formatManwon(result.capLimit) : ""}으로 제한됩니다.`}
                        {result.bottleneck === "ltv" && `DSR 기준으론 ${formatManwon(result.dsrMaxLoan)} 대출이 가능하지만, LTV ${Math.round(result.ltv * 100)}% 한도가 먼저 막힙니다.`}
                        {result.bottleneck === "dsr" && `${region === "regulated" ? "스트레스 DSR 3% 가산으로 적용 금리가 7.5%가 되어" : "DSR 40% 기준으로"} 최대 대출이 ${formatManwon(result.dsrMaxLoan)}으로 제한됩니다.`}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl px-6 py-5 space-y-3">
                      {[
                        { label: "보유 현금", value: formatManwon(cashNum) },
                        { label: "최종 대출 가능액", value: formatManwon(result.loan) },
                        { label: "DSR 기준 최대 대출", value: formatManwon(result.dsrMaxLoan), sub: true },
                      ].map(({ label, value, sub }) => (
                        <div key={label} className={`flex justify-between items-center ${sub ? "opacity-50" : ""}`}>
                          <span className={`text-sm font-medium ${sub ? "text-slate-400 pl-3 text-xs" : "text-slate-500"}`}>{sub ? `└ ${label}` : label}</span>
                          <span className={`text-sm font-bold ${sub ? "text-slate-400 text-xs" : "text-slate-800"}`}>{value}</span>
                        </div>
                      ))}
                      <div className="border-t border-slate-200 pt-3 flex justify-between items-center">
                        <span className="text-slate-700 text-sm font-bold">합계</span>
                        <span className="text-indigo-600 text-sm font-bold">{formatManwon(result.total)}</span>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl px-6 py-4">
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        2025년 10.15 대책 기준 · DSR 40% · {region === "regulated" ? "스트레스 금리 7.5% · LTV 40% · 구간별 한도 적용" : "금리 4.5% · LTV 70%"} · 40년 원리금 균등 상환.
                        실제 대출 한도는 금융기관 심사에 따라 다를 수 있습니다.
                      </p>
                    </div>

                    <button
                      onClick={reset}
                      className="w-full border-2 border-slate-200 text-slate-600 rounded-2xl py-4 text-base font-semibold flex items-center justify-center gap-2 cursor-pointer hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                    >
                      <RotateCcw size={16} /> 다시 계산하기
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}