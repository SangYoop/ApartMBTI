"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      delay,
      ease: [0.25, 0.46, 0.45, 0.94] as const,
    },
  }),
};

export default function HomePage() {
  const router = useRouter();
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6">
      {/* Subtle background gradient orb */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 overflow-hidden"
      >
        <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-indigo-100/60 blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-50/80 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center space-y-8 md:space-y-12 max-w-3xl mx-auto">
        {/* Badge */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0}
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold tracking-wide">
            <Sparkles size={14} strokeWidth={2.5} />
            내집 마련을 준비하고 있는 사람 주목
          </span>
        </motion.div>

        {/* Main Title */}
        <motion.h1
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.12}
          className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 leading-[1.1]"
        >
          첫 집 마련{" "}
          <span className="text-indigo-600">MBTI</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.24}
          className="text-lg md:text-xl font-medium text-slate-500 leading-relaxed max-w-md"
        >
          나는 어떤 부동산이 사고싶은 걸까?
          <br className="hidden md:block" />
          <span className="md:ml-1">12가지 질문으로 알아보는 나의 집 유형.</span>
        </motion.p>

        {/* CTA Button */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.36}
        >
          <motion.button
            onClick={() => router.push("/quiz")}
            whileHover={{
              y: -4,
              boxShadow: "0 20px 40px -12px rgba(79, 70, 229, 0.45)",
            }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 22 }}
            className="inline-flex items-center gap-3 bg-indigo-600 text-white rounded-full px-12 py-6 text-xl font-semibold cursor-pointer select-none"
          >
            테스트 시작하기
            <ArrowRight size={22} strokeWidth={2.5} />
          </motion.button>
        </motion.div>

        {/* Thumbnail preview */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.5}
          className="w-full max-w-2xl mx-auto"
        >
          <div className="rounded-[2rem] overflow-hidden shadow-2xl border border-slate-100/80 ring-1 ring-slate-200/60">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/thumbnail.jpg"
              alt="첫 집 마련 MBTI 결과 미리보기"
              className="w-full h-auto block"
            />
          </div>
        </motion.div>

        {/* 투표 진입 배너 */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          custom={0.62}
          className="w-full max-w-2xl mx-auto"
        >
          <Link href="/polls">
            <div className="flex items-center justify-between gap-4 bg-white border border-slate-100 rounded-2xl px-6 py-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-50">
                  <Users size={18} className="text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800">아파트 밸런스 게임</p>
                  <p className="text-xs text-slate-500">어떤 단지가 더 끌리세요?</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
            </div>
          </Link>
        </motion.div>

      </div>

      {/* Footer hint */}
      <motion.p
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        custom={0.65}
        className="relative z-10 mt-12 text-sm text-slate-400 font-medium"
      >
        무료 · 회원가입 없이 바로 시작
      </motion.p>
    </main>
  );
}
