"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Link, Gift, MapPin, Hash, Quote,
  Lightbulb, Sparkles, X, Calculator, ChevronRight, Camera,
} from "lucide-react";

/* ─────────────────────── mbti data ─────────────────────── */
interface MbtiData {
  title: string;
  desc: string;
  keywords: string[];
  motto: string;
  strategy: string;
}

const MBTI_DATA: Record<string, MbtiData> = {
  UCN: {
    title: "직주근접 스나이퍼",
    desc: "당신에게 부동산이란 단순한 재테크 수단이 아니라, 내 인생에서 '이동'이라는 불필요한 레이어를 걷어낸 완벽한 요새입니다. 직주근접은 당신에게 정의와 같습니다.",
    keywords: ["#직주근접", "#효율", "#집은잠만자는곳"],
    motto: "회사에서 현관문까지의 이 짧은 한 걸음이, 인간의 삶의 질에는 위대한 도약입니다. - 닐 팔힘쎈",
    strategy: "아파트 대신 고퀄리티 오피스텔/빌라를 보세요. 서울 핵심지 아파트는 넘사벽이지만, 신축 오피나 리모델링 빌라는 출퇴근 10분을 사수해줍니다. 남는 에너지로 자산을 불리는 게 더 빠릅니다.",
  },
  UCV: {
    title: "인서울 몸테크 전사",
    desc: "녹물 좀 나오면 어때요? 내일의 재건축 분담금이 오늘의 고통보다 달콤할 텐데. 입지라는 깡패 앞에 무릎 꿇은 당신, 낡은 천장 속에서도 황금빛 미래를 설계하는 불굴의 의지를 가졌습니다.",
    keywords: ["#녹물은필터로", "#존버는승리한다", "#서울신축꿈나무"],
    motto: "나에게는 오직 피와 땀, 눈물, 그리고... 언젠가 떨어질 재건축 확정 고시뿐입니다. - 윈스턴 칠전팔기",
    strategy: "나홀로 아파트 또는 소규모 재건축이 타겟입니다. 대단지 브랜드는 포기하되, 입지 좋은 한 동짜리 아파트나 노후 연립주택에서 대지지분을 확보해 다음 스텝을 도모하세요.",
  },
  UBN: {
    title: "서울 실속 맹모",
    desc: "서울의 탄탄한 학원가와 평지 대단지라는 '안전 자산'에 올인한 당신. 교육과 커리어라는 두 마리 토끼를 잡으려 잠을 줄이는 완벽주의 부부입니다.",
    keywords: ["#학군지사수", "#평지대단지", "#스카이캐슬"],
    motto: "나에게 초품아와 평지 대단지를 달라. 그러면 아이의 성적표를 움직여 보겠다. - 아르키매쓰",
    strategy: "대치·목동 대신 노원의 20평대 구축을 노리세요. 대치동 전세가로 내 집 마련이 가능합니다. 브랜드 신축의 화려함보다 중계동 '은행사거리'의 학군지 입성을 최우선으로 하는 영리한 선택이 필요합니다.",
  },
  UBV: {
    title: "뉴타운 빅픽쳐",
    desc: "서울 등기와 신축의 쾌적함, 그 어려운 교집합을 찾아낼 안목! 아직은 조금 썰렁해 보여도 천지개벽할 뉴타운의 지도를 미리 읽고 깃발을 꽂아봅시다. 숲세권의 공기와 서울의 가치를 동시에 누리는 영리한 전략가입니다.",
    keywords: ["#천지개벽", "#서울몸테크", "#숲세권라이프"],
    motto: "항상 갈망하고, 우직하게 기다려라. 인서울 뉴타운 신축의 문이 열릴 때까지. - 스티브 잡수",
    strategy: "완성된 뉴타운은 비쌉니다. 공공재개발이나 모아타운 후보지로 거론되는 인접 지역의 빌라를 공략해 인프라는 옆 뉴타운 것을 빌려 쓰고, 내 집은 천지개벽을 기다리는 인내심 투자를 하세요.",
  },
  SCN: {
    title: "신도시 힙스터",
    desc: "좁아터진 서울 구축보다, 주차 편하고 광활한 신도시 신축이 내 스타일! 힙한 카페와 수변 공원을 내 거실처럼 누리며 삶의 질을 1순위로 둡니다. 서울의 혼잡함 대신 세련된 여유를 선택한 이 시대의 진정한 미식가입니다.",
    keywords: ["#주차2대거뜬", "#신도시인프라", "#YOLO인하우스"],
    motto: "검토되지 않은 삶은 살 가치가 없고, 주차 대수 1.5대가 안 되는 집은 살 가치가 없다. - 소크라테쓰",
    strategy: "판교, 광교 대신 2기 신도시의 완성된 상권 끝자락 비역세권 단지를 보세요. 주차와 쾌적함은 동일하게 누리면서 자차 이동을 전제로 가격 거품을 뺀 매물을 잡는 것이 팁입니다.",
  },
  SCV: {
    title: "경기도 스나이퍼",
    desc: "서울만 답인가요? 경기도 노른자 입지가 내 자산을 퀀텀 점프시켜 줄 텐데. 천지개벽할 개발 계획을 머릿속에 통째로 넣고 다니며, 저평가된 우량주 동네를 스나이퍼처럼 정확히 저격하는 투자의 귀재입니다.",
    keywords: ["#입지저격수", "#1기신도시재건축", "#넥스트판교"],
    motto: "남들이 서울만 바라볼 때 두려워하고, 남들이 경기도를 무시할 때 탐욕스러워져라. - 워렌 버텨",
    strategy: "경기 남부 개발 호재 지역을 저격하세요. 용인·평택의 기업체 연결 도로망이 좋은 인근 배후 단지를 공략해 고소득 직장인의 탄탄한 전세 수요를 하방 경직성으로 삼아야 합니다.",
  },
  SBN: {
    title: "초품아 VIP",
    desc: "아이들이 안전하게 뛰어노는 것보다 더 중요한 가치가 있을까요? 차 없는 단지, 넓은 중앙 공원, 그리고 바로 옆 초등학교. 유해시설 없는 청정 구역에서 가족의 평화와 정서적 풍요를 가꾸는 사랑 가득한 가디언입니다.",
    keywords: ["#아이들의천국", "#차없는단지", "#유모차프리웨이"],
    motto: "행복은 이미 만들어진 것이 아니다. 그것은 초품아와 평지 공원에서 온다. - 달라이 라마마",
    strategy: "안전한 초품아 신축을 원하지만 예산이 부족하다면, 10년 공공임대 분양전환이나 장기 일반민간임대를 공략하세요. 초기 자본 없이도 아이 졸업까지 안정적으로 거주 가능합니다.",
  },
  SBV: {
    title: "GTX 낭만 가디언",
    desc: "지금은 2시간 통근길이 고되지만, GTX가 뚫리는 날 내 인생의 시간도 뚫릴 것입니다. 서울의 좁은 아파트 대신 파주나 일산의 넓은 평수와 쾌적한 자연을 선택한 당신. 미래를 위해 오늘을 베팅하는 로맨틱 존버러입니다.",
    keywords: ["#휴전선의수호자", "#GTX만믿는다", "#광활한34평"],
    motto: "나는 기다린다, 고로 존재한다. GTX-A가 내 출근길을 20분으로 만들 그날까지. - 데카르트기다려",
    strategy: "GTX 인근 '입주장'의 잔금 급매를 노리세요. 운정, 동탄 등 공급이 쏟아지는 지역의 입주 지정 기간 급매물은 2030이 대장주 신축에 입성할 수 있는 유일한 치트키입니다.",
  },
};

const FALLBACK: MbtiData = {
  title: "알 수 없는 유형",
  desc: "결과를 계산하는 중 오류가 발생했습니다. 테스트를 다시 시도해 주세요.",
  keywords: ["#다시도전"],
  motto: "시도하지 않은 자는 결코 실패하지 않는다. 하지만 집도 없다.",
  strategy: "퀴즈 페이지로 돌아가 다시 시도해 보세요.",
};

/* ─────────────────────── checklist data ─────────────────── */
const CHECKLIST_DATA: Record<string, string[]> = {
  UCN: [
    "현관문에서 개찰구까지 실제 도보 시간 측정 (광고용 '5분' 금지)",
    "집 주변 24시 편의점과 카페(스벅) 위치 및 도보 거리",
    "퇴근 시간대 단지 앞 대중교통 혼잡도 및 실제 배차 간격",
  ],
  UCV: [
    "밤 10시 이후 주차 공간 확보 여부 및 이중 주차 심각도",
    "수돗물 수압 체크 및 녹물 필터 설치 가능 구조인지 확인",
    "관리사무소 방문하여 최근 수선 유지 내역 및 주민 단합도 체크",
  ],
  UBN: [
    "단지에서 학교까지 가는 길에 유해시설이나 위험한 경사로 유무",
    "단지 입구에 학원가 셔틀버스가 안전하게 정차할 공간이 있는가?",
    "단지 내 놀이터와 커뮤니티 시설의 실제 관리 상태 및 청결도",
  ],
  UBV: [
    "뉴타운 내 공공기관/상업지구 예정 부지의 실제 공사 진행 현황",
    "인근 지하철역까지 연결되는 마을버스/공공자전거 동선 확인",
    "단지 주변 숲이나 공원 산책로의 연결성 및 실제 경사도 측정",
  ],
  SCN: [
    "지하 주차장에서 엘리베이터가 집까지 바로 연결되는가? (필수!)",
    "단지 내 상가와 인근 상권의 힙한 카페/배달 맛집 리스트 확인",
    "주말 대형마트(이마트/코스트코) 진입로 정체 구간 및 우회로 유무",
  ],
  SCV: [
    "대기업(삼성/SK 등) 셔틀버스 정류장 위치 및 실제 도보 거리",
    "광역버스 정류장까지의 접근성 및 서울행 광역버스 입석 여부",
    "주변 미개발지(농지/산)의 향후 용도 변경 및 추가 개발 계획",
  ],
  SBN: [
    "단지 정문/쪽문에서 학교 정문까지 '완전한 차 없는 통학로' 확인",
    "단지 앞 소아과, 응급실, 대형 약국까지의 자차 소요 시간",
    "중앙 광장/공원이 유모차를 끌기에 충분히 평평하고 넓은지 확인",
  ],
  SBV: [
    "GTX 예정역까지의 실제 도보/자차 거리 및 연계 교통수단 확인",
    "단지 주변 대형 공원과 호수공원까지의 도보 동선 쾌적함",
    "층간소음 방지 설계 여부 및 거실 창 밖의 '영구 조망권' 사수",
  ],
};

/* ─────────────────────── calculator logic ─────────────────── */
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

  // ① DSR 40% 기반 최대 대출 (소득으로 고정 산출)
  const dsrMaxLoan = Math.floor(((incomeMan * 0.4) / 12) * af / 100) * 100;

  // ② 1차 P(현금 + DSR 최대 대출) 기준으로 LTV 한도 산출
  const pFirst = cashMan + dsrMaxLoan;
  const ltvMaxLoan = Math.floor(pFirst * ltv / 100) * 100;

  // ③ DSR·LTV 중 더 엄격한 기준 적용
  const uncappedLoan = Math.min(dsrMaxLoan, ltvMaxLoan);

  // 비규제 지역: 구간 캡 없음
  if (!isRegulated) {
    const loan = uncappedLoan;
    const total = cashMan + loan;
    const monthlyPayment = loan > 0 ? loan / af : 0;
    const dsrPct = incomeMan > 0 ? Math.round(monthlyPayment * 12 / incomeMan * 1000) / 10 : 0;
    const bottleneck: Bottleneck = ltvMaxLoan < dsrMaxLoan ? "ltv" : "dsr";
    return { total, loan, monthlyPayment, ltv, dsrMaxLoan, bottleneck, capLimit: null, dsrPct };
  }

  // ④ 규제지역: 10.15 대책 구간별 대출 절벽 적용
  //    P가 어느 구간에 속하는지에 따라 캡이 달라지므로, 각 구간을 독립적으로 확인
  const brackets = [
    { cap: 60_000, lo: 0,       hi: 150_000 },  // ≤15억 → 6억 한도
    { cap: 40_000, lo: 150_001, hi: 250_000 },  // 15억초과~25억 → 4억 한도
    { cap: 20_000, lo: 250_001, hi: Infinity }, // 25억초과 → 2억 한도
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

  // 병목 판별
  const capApplied = bestCap !== null && uncappedLoan > bestCap;
  let bottleneck: Bottleneck = "dsr";
  if (capApplied) {
    bottleneck = "cap";
  } else if (ltvMaxLoan < dsrMaxLoan) {
    bottleneck = "ltv";
  }

  return { total, loan, monthlyPayment, ltv, dsrMaxLoan, bottleneck, capLimit: capApplied ? bestCap : null, dsrPct };
}

function formatManwon(manwon: number): string {
  const rounded = Math.round(manwon / 100) * 100;
  const eok = Math.floor(rounded / 10000);
  const man = rounded % 10000;
  if (eok === 0) return `${man.toLocaleString()}만원`;
  if (man === 0) return `${eok.toLocaleString()}억원`;
  return `${eok.toLocaleString()}억 ${man.toLocaleString()}만원`;
}

/* ─────────────────────── calculator sheet ─────────────────── */
function CalculatorSheet({
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
  const result =
    step === "result" ? calcAffordable(cashNum, incomeNum, region) : null;

  const stepVariants = {
    enter: { opacity: 0, x: 30 },
    center: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] as const } },
    exit: { opacity: 0, x: -30, transition: { duration: 0.2 } },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320, mass: 0.9 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-[2.5rem] max-h-[92vh] flex flex-col"
          >
            {/* Handle */}
            <div className="flex justify-center pt-4 pb-2 shrink-0">
              <div className="w-10 h-1 rounded-full bg-slate-200" />
            </div>

            {/* Header */}
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

            {/* Step content */}
            <div className="flex-1 overflow-y-auto px-8 pb-10">
              <AnimatePresence mode="wait">
                {/* ── Step 1: Region ── */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
                    <p className="text-slate-500 text-base font-medium mb-8">
                      매수하려는 주택의 규제 여부를 선택해 주세요.
                      <br />
                      <span className="text-slate-400 text-sm">금리·LTV·대출 한도가 모두 달라집니다.</span>
                    </p>

                    {/* Segment control */}
                    <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-4">
                      {(["regulated", "unregulated"] as Region[]).map((r) => (
                        <button
                          key={r}
                          onClick={() => setRegion(r)}
                          className={`flex-1 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer leading-tight ${
                            region === r
                              ? "bg-white text-indigo-600 shadow-sm"
                              : "text-slate-500 hover:text-slate-700"
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

                {/* ── Step 2: Cash ── */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
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
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">
                        만원
                      </span>
                    </div>

                    {cash && (
                      <p className="text-sm text-indigo-500 font-semibold mb-8 px-1">
                        = {formatManwon(parseFloat(cash) || 0)}
                      </p>
                    )}
                    {!cash && <div className="mb-8" />}

                    <button
                      onClick={() => cashNum > 0 && setStep(3)}
                      disabled={cashNum <= 0}
                      className="w-full bg-indigo-600 text-white rounded-2xl py-5 text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      다음 <ChevronRight size={18} />
                    </button>
                  </motion.div>
                )}

                {/* ── Step 3: Income ── */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                  >
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
                      <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-semibold text-lg">
                        만원
                      </span>
                    </div>

                    {income && (
                      <p className="text-sm text-indigo-500 font-semibold mb-8 px-1">
                        = {formatManwon(parseFloat(income) || 0)} / 연
                      </p>
                    )}
                    {!income && <div className="mb-8" />}

                    <button
                      onClick={() => incomeNum > 0 && setStep("result")}
                      disabled={incomeNum <= 0}
                      className="w-full bg-indigo-600 text-white rounded-2xl py-5 text-lg font-semibold flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      계산하기 <Calculator size={18} />
                    </button>
                  </motion.div>
                )}

                {/* ── Result ── */}
                {step === "result" && result && (
                  <motion.div
                    key="result"
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-4"
                  >
                    {/* ① 최대 매수 가능 금액 */}
                    <div
                      className="rounded-[2rem] px-8 py-10 text-center"
                      style={{ backgroundColor: "#4f46e5" }}
                    >
                      <p className="text-indigo-300 text-xs font-bold tracking-widest uppercase mb-4">
                        최대 매수 가능 금액
                      </p>
                      <p className="text-white text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
                        {formatManwon(result.total)}
                      </p>
                    </div>

                    {/* ② 월 상환액 강조 */}
                    <div className="bg-indigo-50 rounded-2xl px-7 py-6 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-indigo-400 tracking-widest uppercase mb-1">
                          매월 예상 상환액
                        </p>
                        <p className="text-2xl font-extrabold text-indigo-600 tracking-tight">
                          월 {formatManwon(result.monthlyPayment)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="inline-block bg-white text-indigo-500 text-xs font-bold px-3 py-1.5 rounded-full border border-indigo-100">
                          DSR {result.dsrPct}%
                        </span>
                        <p className="text-xs text-indigo-300 font-medium mt-1.5">
                          원금 + 이자 균등 납부
                        </p>
                      </div>
                    </div>

                    {/* ③ 병목 알림 */}
                    <div className={`rounded-2xl px-6 py-4 border ${
                      result.bottleneck === "cap"
                        ? "bg-red-50 border-red-200"
                        : result.bottleneck === "ltv"
                        ? "bg-orange-50 border-orange-200"
                        : "bg-yellow-50 border-yellow-200"
                    }`}>
                      <p className={`text-xs font-bold tracking-wide mb-1.5 ${
                        result.bottleneck === "cap" ? "text-red-600"
                        : result.bottleneck === "ltv" ? "text-orange-600"
                        : "text-yellow-700"
                      }`}>
                        {result.bottleneck === "cap" &&
                          `⚠️ ${result.capLimit === 60_000 ? "15억 이하" : result.capLimit === 40_000 ? "15억 초과" : "25억 초과"} 한도(${result.capLimit ? formatManwon(result.capLimit) : ""}) 규제 적용됨`}
                        {result.bottleneck === "ltv" &&
                          `⚠️ LTV ${Math.round(result.ltv * 100)}% 한도 규제 적용됨`}
                        {result.bottleneck === "dsr" &&
                          `⚠️ 스트레스 DSR ${region === "regulated" ? "3.0%" : ""} 적용됨`}
                      </p>
                      <p className={`text-xs font-medium leading-relaxed ${
                        result.bottleneck === "cap" ? "text-red-700"
                        : result.bottleneck === "ltv" ? "text-orange-700"
                        : "text-yellow-800"
                      }`}>
                        {result.bottleneck === "cap" &&
                          `10.15 대책 대출 절벽 구간입니다. DSR 기준으론 ${formatManwon(result.dsrMaxLoan)} 대출이 가능하지만, 주택가격 구간별 한도 ${result.capLimit ? formatManwon(result.capLimit) : ""}으로 제한됩니다.`}
                        {result.bottleneck === "ltv" &&
                          `DSR 기준으론 ${formatManwon(result.dsrMaxLoan)} 대출이 가능하지만, LTV ${Math.round(result.ltv * 100)}% 한도가 먼저 막힙니다.`}
                        {result.bottleneck === "dsr" &&
                          `${region === "regulated" ? "스트레스 DSR 3% 가산으로 적용 금리가 7.5%가 되어" : "DSR 40% 기준으로"} 최대 대출이 ${formatManwon(result.dsrMaxLoan)}으로 제한됩니다.`}
                      </p>
                    </div>

                    {/* ④ 내역 분해 */}
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

                    {/* ⑤ 계산 조건 */}
                    <div className="bg-slate-50 rounded-2xl px-6 py-4">
                      <p className="text-xs text-slate-400 font-medium leading-relaxed">
                        2025년 10.15 대책 기준 · DSR 40% · {region === "regulated" ? "스트레스 금리 7.5% · LTV 40% · 구간별 한도 적용" : "금리 4.5% · LTV 70%"} · 40년 원리금 균등 상환.
                        실제 대출 한도는 금융기관 심사에 따라 다를 수 있습니다.
                      </p>
                    </div>

                    {/* ⑥ 다시 계산 */}
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

/* ─────────────────────── animations ─────────────────── */
const container = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.09, delayChildren: 0.1 },
  },
};

const card = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

/* ─────────────────────── sub-components ──────────────── */
function BentoCard({
  className = "",
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      variants={card}
      style={style}
      className={`bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 ${className}`}
    >
      {children}
    </motion.div>
  );
}

function SectionLabel({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <span className="text-indigo-400">{icon}</span>
      <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">
        {label}
      </span>
    </div>
  );
}

/* ─────────────────────── inner page ─────────────────── */
function ResultInner() {
  const router = useRouter();
  const params = useSearchParams();
  const typeCode = (params.get("type") ?? "").toUpperCase();
  const data = MBTI_DATA[typeCode] ?? FALLBACK;

  const [calcOpen, setCalcOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const checklist = CHECKLIST_DATA[typeCode] ?? [];
  const [checked, setChecked] = useState<boolean[]>(() => checklist.map(() => false));

  function toggleCheck(i: number) {
    setChecked((prev) => prev.map((v, idx) => (idx === i ? !v : v)));
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  }

  function handleShareResult() {
    navigator.clipboard.writeText(window.location.href);
    showToast("링크가 복사되었습니다. 친구에게 내 성향을 알려주세요!");
  }

  function handleShareRecommend() {
    navigator.clipboard.writeText(window.location.origin);
    showToast("링크가 클립보드에 복사되었습니다. 친구에게 링크를 공유해보세요!");
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-12 md:py-20">
        <div className="max-w-3xl mx-auto">
          {/* Top label */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2 mb-8"
          >
            <MapPin size={14} className="text-indigo-400" />
            <span className="text-sm font-semibold text-indigo-500 tracking-wide">
              첫 집 마련 MBTI — 결과
            </span>
          </motion.div>

          {/* Bento grid */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Card 1 — Hero */}
            <BentoCard className="md:col-span-2 flex flex-col justify-between gap-6">
              <div>
                <span className="inline-block text-xs font-bold tracking-widest uppercase text-indigo-400 mb-4">
                  당신은
                </span>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-tight mb-2">
                  {data.title}
                </h1>
                <div className="flex items-center gap-2 mt-2 mb-6">
                  <span className="inline-block bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-bold px-3 py-1 rounded-full">
                    {typeCode}
                  </span>
                </div>
                <p className="text-slate-500 text-base md:text-lg leading-relaxed font-medium">
                  {data.desc}
                </p>
              </div>
            </BentoCard>

            {/* Card 2 — Keywords */}
            <BentoCard className="md:col-span-1 flex flex-col">
              <SectionLabel icon={<Hash size={14} />} label="키워드" />
              <div className="flex flex-col gap-3 mt-auto">
                {data.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="inline-block bg-indigo-50 text-indigo-600 font-semibold text-base px-5 py-3 rounded-2xl text-center tracking-tight"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </BentoCard>

            {/* Card 3 — Motto */}
            <motion.div
              variants={card}
              className="md:col-span-3 rounded-[2.5rem] p-8 shadow-sm"
              style={{ backgroundColor: "#4f46e5" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Quote size={14} className="text-indigo-300" />
                <span className="text-xs font-bold text-indigo-300 tracking-widest uppercase">
                  격언
                </span>
              </div>
              <blockquote className="text-white text-xl md:text-2xl font-semibold italic leading-relaxed tracking-tight">
                &ldquo;{data.motto}&rdquo;
              </blockquote>
            </motion.div>

            {/* Card 4 — Strategy */}
            <BentoCard className="md:col-span-3">
              <SectionLabel icon={<Lightbulb size={14} />} label="현실적인 부동산 전략" />
              <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                {data.strategy}
              </p>
            </BentoCard>

            {/* Card 4-b — Imjang Checklist */}
            {checklist.length > 0 && (
              <BentoCard className="md:col-span-3">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-7">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Camera size={14} className="text-indigo-400" />
                      <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">
                        임장 체크리스트
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-snug">
                      📸 캡처 필수!&nbsp;
                      <span className="text-indigo-600">{data.title}</span>을 위한<br className="sm:hidden" /> 임장 체크리스트
                    </h3>
                  </div>
                  {/* Completion badge */}
                  <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600">
                    <span className="text-lg font-extrabold leading-none">
                      {checked.filter(Boolean).length}/{checklist.length}
                    </span>
                    <span className="text-[10px] font-semibold mt-0.5">완료</span>
                  </div>
                </div>

                {/* Checklist items */}
                <ul className="space-y-3 mb-7">
                  {checklist.map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => toggleCheck(i)}
                        className="w-full flex items-start gap-4 group cursor-pointer text-left"
                      >
                        {/* Custom checkbox */}
                        <span
                          className={`shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            checked[i]
                              ? "bg-indigo-600 border-indigo-600"
                              : "border-slate-300 group-hover:border-indigo-400"
                          }`}
                        >
                          {checked[i] && (
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                              <path
                                d="M1 5L4.5 8.5L11 1"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </span>
                        {/* Label */}
                        <span
                          className={`text-base font-medium leading-snug transition-colors duration-200 ${
                            checked[i]
                              ? "text-slate-300 line-through"
                              : "text-slate-700 group-hover:text-indigo-600"
                          }`}
                        >
                          {item}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Footer hint */}
                <div className="flex items-center gap-2 bg-indigo-50 rounded-2xl px-5 py-3.5">
                  <Camera size={14} className="text-indigo-400 shrink-0" />
                  <p className="text-xs font-semibold text-indigo-500">
                    이 화면을 캡처해서 부동산 방문 시 활용해 보세요!
                  </p>
                </div>
              </BentoCard>
            )}

            {/* Card 5 — Support */}
            <BentoCard
              className="md:col-span-3"
              style={{ background: "linear-gradient(135deg, #ffffff 0%, rgba(238,242,255,0.5) 100%)" }}
            >
              <div className="flex items-start gap-5">
                <div className="shrink-0 w-11 h-11 rounded-2xl bg-indigo-50 flex items-center justify-center mt-0.5">
                  <Sparkles size={20} className="text-indigo-500" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3 tracking-tight">
                    당신을 향한 진심 어린 응원
                  </h3>
                  <p className="text-slate-500 text-base leading-relaxed font-medium">
                    집은 단순히 사는(Buy) 것이 아니라, 나만의 우주를 만드는(Build) 곳입니다.
                    직주근접, 쾌적함, 넓은 평형 등 모든 것을 다 갖추면 좋겠지만 이 모든 것을 다 갖춘 집은 누구나 원하는 집이기 때문에 비쌀 수 밖에 없습니다.
                    현실적인 제약 아래에서 내가 절대 포기 못하는 우선순위를 정리하고, 각 우선순위에 맞는 의사결정을 통해 남들과의 비교와 좌절에 갇히지 말고 내 인생을 행복하게 가꿀 수 있는 공간을 마련해 보세요.
                  </p>
                </div>
              </div>
            </BentoCard>

            {/* Card 6 — Actions */}
            <BentoCard className="md:col-span-3">
              <div className="flex flex-col gap-4">
                {/* Calculator CTA */}
                <motion.button
                  onClick={() => setCalcOpen(true)}
                  whileHover={{ y: -2, boxShadow: "0 12px 32px -8px rgba(79,70,229,0.35)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="w-full bg-indigo-600 text-white rounded-2xl py-5 text-lg font-semibold flex items-center justify-center gap-3 cursor-pointer"
                >
                  <Calculator size={20} strokeWidth={2} />
                  내집마련 계산기 실행하기 🧮
                </motion.button>

                {/* Secondary buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    onClick={() => router.push("/quiz")}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="inline-flex items-center gap-2.5 border-2 border-slate-200 text-slate-700 rounded-full px-8 py-4 text-base font-semibold cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors w-full sm:w-auto justify-center"
                  >
                    <RotateCcw size={16} strokeWidth={2.5} />
                    테스트 다시하기
                  </motion.button>
                </div>

                {/* Share buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    onClick={handleShareResult}
                    whileHover={{ y: -2, boxShadow: "0 8px 24px -6px rgba(79,70,229,0.35)" }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="inline-flex items-center gap-2.5 bg-indigo-600 text-white rounded-full px-8 py-4 text-base font-semibold cursor-pointer hover:bg-indigo-700 transition-colors flex-1 justify-center"
                  >
                    <Link size={16} strokeWidth={2.5} />
                    내 결과 공유하기
                  </motion.button>
                  <motion.button
                    onClick={handleShareRecommend}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    transition={{ type: "spring", stiffness: 400, damping: 22 }}
                    className="inline-flex items-center gap-2.5 border-2 border-slate-200 text-slate-700 rounded-full px-8 py-4 text-base font-semibold cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 transition-colors flex-1 justify-center"
                  >
                    <Gift size={16} strokeWidth={2.5} />
                    친구에게 추천
                  </motion.button>
                </div>
              </div>
            </BentoCard>
          </motion.div>
        </div>
      </main>

      <CalculatorSheet open={calcOpen} onClose={() => setCalcOpen(false)} />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.25 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-sm font-semibold px-6 py-3.5 rounded-2xl shadow-xl whitespace-nowrap"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ─────────────────────── page export ─────────────────── */
export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50" />}>
      <ResultInner />
    </Suspense>
  );
}
