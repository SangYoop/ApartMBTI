"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────── types ─────────────────────────── */
type Axis = "US" | "CB" | "NV";
type Choice = "U" | "S" | "C" | "B" | "N" | "V";

interface Question {
  id: number;
  axis: Axis;
  text: string;
  options: [{ label: string; value: Choice }, { label: string; value: Choice }];
}

/* ───────────────────────── quiz data ───────────────────────── */
const QUESTIONS: Question[] = [
  {
    id: 1,
    axis: "US",
    text: "매일 아침 출근길, 그래도 굳이 선택한다면?",
    options: [
      { label: "환승 2번은 기본! 40분간 꽉 낀 채 영혼 탈출하는 인서울 지옥철", value: "U" },
      { label: "환승 없이 1시간! 대신 무조건 앉아서 유튜브 정주행하는 광역버스", value: "S" },
    ],
  },
  {
    id: 2,
    axis: "US",
    text: "주말 아침, 창밖으로 보였으면 하는 풍경은?",
    options: [
      { label: "활기찬 도시의 소음과 고층 빌딩 숲의 시티뷰", value: "U" },
      { label: "새 소리 들리는 한적한 공원과 탁 트인 마운틴뷰", value: "S" },
    ],
  },
  {
    id: 3,
    axis: "US",
    text: "퇴근 후 우리 부부의 저녁 풍경은?",
    options: [
      { label: "집 앞 힙한 맛집에서 즐기는 시끌벅적한 밤", value: "U" },
      { label: "단지 내 산책로에서 조용히 대화하며 걷는 밤", value: "S" },
    ],
  },
  {
    id: 4,
    axis: "CB",
    text: "한정된 예산, 딱 하나의 집을 고른다면?",
    options: [
      { label: "좁아도 서울! 둘이 살기 딱 좋은 20평대 구축", value: "C" },
      { label: "멀어도 평수! 아이 키우기 널찍한 30평대 신축", value: "B" },
    ],
  },
  {
    id: 5,
    axis: "CB",
    text: "집 근처 필수 인프라 1순위는?",
    options: [
      { label: "부부의 불금을 책임질 와인바와 트렌디한 카페", value: "C" },
      { label: "유모차 끌기 편한 평지와 단지 내 대형 어린이집", value: "B" },
    ],
  },
  {
    id: 6,
    axis: "CB",
    text: "우리 집 인테리어의 꽃은?",
    options: [
      { label: "취향 가득! 게임룸이나 홈바 등 부부의 취미룸", value: "C" },
      { label: "아이와 뒹굴뒹굴! 광활한 거실과 널찍한 공용 공간", value: "B" },
    ],
  },
  {
    id: 7,
    axis: "NV",
    text: "이사할 동네를 볼 때 가장 먼저 체크하는 건?",
    options: [
      { label: "백화점, 대형병원, 학원가 등 이미 다 갖춰진 인프라", value: "N" },
      { label: "GTX 개통, 대규모 재개발 등 앞으로 변할 미래 지도", value: "V" },
    ],
  },
  {
    id: 8,
    axis: "NV",
    text: "집값이 오를 거란 믿음의 근거는?",
    options: [
      { label: "절대 무너지지 않는 탄탄한 배후 수요와 찐 입지", value: "N" },
      { label: "천지개벽할 개발 호재! 내 주식보다 확실한 한 방", value: "V" },
    ],
  },
  {
    id: 9,
    axis: "NV",
    text: "당장 살 집의 컨디션, 당신의 우선순위는?",
    options: [
      { label: "이미 검증된 동네의 평화롭고 안정적인 분위기", value: "N" },
      { label: "지금은 조금 불편해도 2~3년 뒤 대장이 될 유망주", value: "V" },
    ],
  },
];

/* ─────────────────────── result logic ─────────────────────── */
function calcResult(answers: Choice[]): string {
  const count: Record<string, number> = {
    U: 0, S: 0, C: 0, B: 0, N: 0, V: 0,
  };
  answers.forEach((c) => count[c]++);

  const first = count.U >= count.S ? "U" : "S";
  const second = count.C >= count.B ? "C" : "B";
  const third = count.N >= count.V ? "N" : "V";
  return `${first}${second}${third}`;
}

/* ──────────────────────── animations ──────────────────────── */
const cardVariants = {
  enter: { opacity: 0, x: 60 },
  center: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
  exit: {
    opacity: 0,
    x: -60,
    transition: { duration: 0.28, ease: [0.55, 0, 1, 0.45] as const },
  },
};

/* ──────────────────────────── page ────────────────────────── */
export default function QuizPage() {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Choice[]>([]);
  const [selected, setSelected] = useState<Choice | null>(null);

  const question = QUESTIONS[current];
  const progress = current / QUESTIONS.length;

  function handleSelect(value: Choice) {
    if (selected !== null) return;
    setSelected(value);

    setTimeout(() => {
      const next = [...answers, value];
      if (current + 1 >= QUESTIONS.length) {
        const code = calcResult(next);
        router.push(`/result?type=${code}`);
      } else {
        setAnswers(next);
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 220);
  }

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col">
      {/* Progress bar */}
      <div className="w-full h-1 bg-slate-200">
        <motion.div
          className="h-full bg-indigo-600 rounded-full origin-left"
          animate={{ scaleX: progress === 0 ? 0.02 : progress + 1 / QUESTIONS.length }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{ transformOrigin: "left" }}
        />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-5 max-w-xl mx-auto w-full">
        <span className="text-sm font-semibold text-indigo-600 tracking-wide">
          첫 집 마련 MBTI
        </span>
        <span className="text-sm font-medium text-slate-400">
          {current + 1} / {QUESTIONS.length}
        </span>
      </header>

      {/* Quiz card area */}
      <div className="flex-1 flex items-center justify-center px-4 pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            variants={cardVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="bg-white border border-slate-100 p-8 md:p-12 rounded-[2.5rem] shadow-sm max-w-xl w-full"
          >
            {/* Question number badge */}
            <div className="mb-6">
              <span className="inline-block text-xs font-bold text-indigo-400 tracking-widest uppercase">
                Q{question.id}
              </span>
            </div>

            {/* Question text */}
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight mb-10 leading-snug">
              {question.text}
            </h2>

            {/* Options */}
            <div className="flex flex-col gap-4">
              {question.options.map((opt) => {
                const isSelected = selected === opt.value;
                const isOther = selected !== null && selected !== opt.value;

                return (
                  <motion.button
                    key={opt.value}
                    onClick={() => handleSelect(opt.value)}
                    animate={{
                      opacity: isOther ? 0.38 : 1,
                      scale: isSelected ? 0.98 : 1,
                    }}
                    transition={{ duration: 0.18 }}
                    className={[
                      "w-full py-6 px-8 text-left text-lg font-medium rounded-2xl border-2 transition-all duration-200",
                      "text-slate-700 leading-snug",
                      isSelected
                        ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                        : "border-slate-100 bg-slate-50 hover:border-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 active:scale-[0.98]",
                    ].join(" ")}
                  >
                    <span className="mr-3 text-sm font-bold text-indigo-400">
                      {opt.value === question.options[0].value ? "A" : "B"}
                    </span>
                    {opt.label}
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
