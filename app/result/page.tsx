"use client";

import { Suspense, useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  RotateCcw, Link, Gift, MapPin, Hash, Quote,
  Lightbulb, Sparkles, Calculator, Camera,
} from "lucide-react";
import { getSupabase } from "@/lib/supabase";
import MortgageCalculator from "@/components/MortgageCalculator";

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

/* ─────────────────────── animations ─────────────────── */
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
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
      <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">{label}</span>
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
  const hasInserted = useRef(false);

  useEffect(() => {
    if (!typeCode || !MBTI_DATA[typeCode]) return;
    if (hasInserted.current) return;
    hasInserted.current = true;

    getSupabase()
      .from("quiz_results")
      .insert({ result_type: typeCode })
      .then(({ error }) => {
        if (error) hasInserted.current = false;
      });
  }, [typeCode]);

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

          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* Hero */}
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

            {/* Keywords */}
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

            {/* Motto */}
            <motion.div
              variants={card}
              className="md:col-span-3 rounded-[2.5rem] p-8 shadow-sm"
              style={{ backgroundColor: "#4f46e5" }}
            >
              <div className="flex items-center gap-2 mb-5">
                <Quote size={14} className="text-indigo-300" />
                <span className="text-xs font-bold text-indigo-300 tracking-widest uppercase">격언</span>
              </div>
              <blockquote className="text-white text-xl md:text-2xl font-semibold italic leading-relaxed tracking-tight">
                &ldquo;{data.motto}&rdquo;
              </blockquote>
            </motion.div>

            {/* Strategy */}
            <BentoCard className="md:col-span-3">
              <SectionLabel icon={<Lightbulb size={14} />} label="현실적인 부동산 전략" />
              <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
                {data.strategy}
              </p>
            </BentoCard>

            {/* Checklist */}
            {checklist.length > 0 && (
              <BentoCard className="md:col-span-3">
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
                      <span className="text-indigo-600">{data.title}</span>을 위한
                      <br className="sm:hidden" /> 임장 체크리스트
                    </h3>
                  </div>
                  <div className="shrink-0 flex flex-col items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600">
                    <span className="text-lg font-extrabold leading-none">
                      {checked.filter(Boolean).length}/{checklist.length}
                    </span>
                    <span className="text-[10px] font-semibold mt-0.5">완료</span>
                  </div>
                </div>
                <ul className="space-y-3 mb-7">
                  {checklist.map((item, i) => (
                    <li key={i}>
                      <button
                        onClick={() => toggleCheck(i)}
                        className="w-full flex items-start gap-4 group cursor-pointer text-left"
                      >
                        <span
                          className={`shrink-0 mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 ${
                            checked[i]
                              ? "bg-indigo-600 border-indigo-600"
                              : "border-slate-300 group-hover:border-indigo-400"
                          }`}
                        >
                          {checked[i] && (
                            <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                              <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </span>
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
                <div className="flex items-center gap-2 bg-indigo-50 rounded-2xl px-5 py-3.5">
                  <Camera size={14} className="text-indigo-400 shrink-0" />
                  <p className="text-xs font-semibold text-indigo-500">
                    이 화면을 캡처해서 부동산 방문 시 활용해 보세요!
                  </p>
                </div>
              </BentoCard>
            )}

            {/* Support */}
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

            {/* Actions */}
            <BentoCard className="md:col-span-3">
              <div className="flex flex-col gap-4">
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

      <MortgageCalculator open={calcOpen} onClose={() => setCalcOpen(false)} />

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
