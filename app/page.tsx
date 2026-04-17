"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Users, Calculator, TrendingUp, Trophy } from "lucide-react";
import { getSupabase, Apartment } from "@/lib/supabase";
import MortgageCalculator from "@/components/MortgageCalculator";

/* ── 타입 ── */
interface PollOption { id: string; apartment_id: string; vote_count: number; }
interface HotPoll {
  id: string;
  title: string;
  options: (PollOption & { apartment?: Pick<Apartment, "danjiName" | "sigungu"> })[];
  totalVotes: number;
}
interface QuizStats { count: number; topType: string | null; topTypeName: string | null; }

const TYPE_NAMES: Record<string, string> = {
  UCN: "직주근접 스나이퍼", UCV: "인서울 몸테크 전사",
  UBN: "서울 실속 맹모",   UBV: "뉴타운 빅픽쳐",
  SCN: "신도시 힙스터",    SCV: "경기도 스나이퍼",
  SBN: "초품아 VIP",       SBV: "GTX 낭만 가디언",
};

/* ── 애니메이션 ── */
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

/* ── 데이터 페칭 ── */
async function fetchHotPoll(): Promise<HotPoll | null> {
  const { data: polls } = await getSupabase()
    .from("polls")
    .select("id, title, poll_options(id, apartment_id, vote_count)")
    .limit(20);
  if (!polls?.length) return null;

  const withTotals = polls.map((p) => ({
    ...p,
    totalVotes: (p.poll_options as PollOption[]).reduce((s: number, o) => s + o.vote_count, 0),
  }));
  const hot = withTotals.sort((a, b) => b.totalVotes - a.totalVotes)[0];
  if (!hot) return null;

  const aptIds = (hot.poll_options as PollOption[]).map((o) => o.apartment_id);
  const { data: apts } = await getSupabase()
    .from("apartData")
    .select("danjiCode, danjiName, sigungu")
    .in("danjiCode", aptIds);

  const aptMap = new Map((apts ?? []).map((a) => [a.danjiCode, a]));
  return {
    id: hot.id,
    title: hot.title,
    totalVotes: hot.totalVotes,
    options: (hot.poll_options as PollOption[]).map((o) => ({
      ...o,
      apartment: aptMap.get(o.apartment_id),
    })),
  };
}

async function fetchQuizStats(): Promise<QuizStats> {
  const { count } = await getSupabase()
    .from("quiz_results")
    .select("*", { count: "exact", head: true });

  const { data: rows } = await getSupabase()
    .from("quiz_results")
    .select("result_type");

  const tally: Record<string, number> = {};
  rows?.forEach((r) => { tally[r.result_type] = (tally[r.result_type] ?? 0) + 1; });
  const topType = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

  return { count: count ?? 0, topType, topTypeName: topType ? (TYPE_NAMES[topType] ?? null) : null };
}

/* ── 페이지 ── */
export default function HomePage() {
  const router = useRouter();
  const [calcOpen, setCalcOpen] = useState(false);
  const [hotPoll, setHotPoll] = useState<HotPoll | null>(null);
  const [stats, setStats] = useState<QuizStats>({ count: 0, topType: null, topTypeName: null });

  useEffect(() => {
    fetchHotPoll().then(setHotPoll);
    fetchQuizStats().then(setStats);
  }, []);

  return (
    <>
      <main className="min-h-screen bg-slate-50 px-4 py-8 md:py-14">
        {/* 배경 */}
        <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-64 left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-indigo-100/50 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-indigo-50/70 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          {/* 뱃지 */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex justify-center mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-sm font-semibold">
              <Sparkles size={13} strokeWidth={2.5} />
              내집 마련을 준비하고 있는 사람 주목
            </span>
          </motion.div>

          {/* 벤토 그리드 */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            {/* ── Block 1: Hero ── */}
            <motion.div
              variants={item}
              className="md:col-span-2 bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col"
            >
              <div className="p-8 flex flex-col gap-5 flex-1">
                <div>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 leading-[1.1] mb-3">
                    첫 집 마련{" "}
                    <span className="text-indigo-600">MBTI</span>
                  </h1>
                  <p className="text-slate-500 text-base font-medium leading-relaxed">
                    나는 어떤 부동산이 사고싶은 걸까?
                    <br />12가지 질문으로 알아보는 나의 집 유형.
                  </p>
                </div>
                <motion.button
                  onClick={() => router.push("/quiz")}
                  whileHover={{ y: -3, boxShadow: "0 16px 36px -8px rgba(79,70,229,0.4)" }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 400, damping: 22 }}
                  className="self-start inline-flex items-center gap-2.5 bg-indigo-600 text-white rounded-full px-8 py-4 text-base font-semibold cursor-pointer"
                >
                  테스트 시작하기
                  <ArrowRight size={18} strokeWidth={2.5} />
                </motion.button>
              </div>
              {/* 썸네일 */}
              <motion.div
                whileHover={{ scale: 1.02, rotate: 0.8 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className="mx-6 mb-6 rounded-2xl overflow-hidden border border-slate-100 shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/thumbnail.jpg"
                  alt="첫 집 마련 MBTI 결과 미리보기"
                  className="w-full h-auto block"
                />
              </motion.div>
            </motion.div>

            {/* ── Block 2: 소셜 프루프 ── */}
            <motion.div
              variants={item}
              className="md:col-span-1 bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7 flex flex-col justify-between gap-6"
            >
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Users size={14} className="text-indigo-400" />
                  <span className="text-xs font-bold text-indigo-400 tracking-widest uppercase">참여 현황</span>
                </div>
                {stats.count > 0 ? (
                  <>
                    <p className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {stats.count.toLocaleString()}
                      <span className="text-2xl font-bold text-slate-400">명</span>
                    </p>
                    <p className="text-sm text-slate-500 font-medium mt-1">이 테스트에 참여했어요</p>
                  </>
                ) : (
                  <>
                    <p className="text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                      아직 첫 번째<br />참여자가 없어요
                    </p>
                    <p className="text-sm text-slate-400 font-medium mt-1">가장 먼저 시작해보세요!</p>
                  </>
                )}
              </div>

              {stats.topTypeName && (
                <div className="bg-indigo-50 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Trophy size={12} className="text-indigo-400" />
                    <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase">인기 유형 1위</span>
                  </div>
                  <p className="text-sm font-extrabold text-indigo-700 leading-snug">{stats.topTypeName}</p>
                  <p className="text-xs text-indigo-400 font-medium mt-0.5">{stats.topType}</p>
                </div>
              )}

              <motion.button
                onClick={() => router.push("/quiz")}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="w-full bg-slate-900 text-white rounded-2xl py-4 text-sm font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-indigo-600 transition-colors"
              >
                내 유형 알아보기
                <ArrowRight size={15} />
              </motion.button>
            </motion.div>

            {/* ── Block 3: Hot 매치업 ── */}
            <motion.div variants={item} className="md:col-span-2">
              {hotPoll ? (
                <Link href={`/polls/${hotPoll.id}`}>
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7 hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col gap-5">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-rose-400" />
                      <span className="text-xs font-bold text-rose-400 tracking-widest uppercase">🔥 Hot 매치업</span>
                    </div>
                    <p className="text-base font-bold text-slate-800 leading-snug group-hover:text-indigo-600 transition-colors">
                      {hotPoll.title}
                    </p>
                    <div className="grid grid-cols-2 gap-3 flex-1">
                      {hotPoll.options.slice(0, 2).map((opt) => {
                        const pct = hotPoll.totalVotes > 0
                          ? Math.round((opt.vote_count / hotPoll.totalVotes) * 100)
                          : null;
                        return (
                          <div key={opt.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                            <p className="text-sm font-bold text-slate-800 truncate">
                              {opt.apartment?.danjiName ?? "—"}
                            </p>
                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                              {opt.apartment?.sigungu ?? ""}
                            </p>
                            {pct !== null && (
                              <div className="mt-3">
                                <div className="flex justify-between text-xs mb-1.5">
                                  <span className="font-bold text-indigo-600">{pct}%</span>
                                  <span className="text-slate-400">{opt.vote_count}표</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>{hotPoll.totalVotes.toLocaleString()}명 참여</span>
                      <span className="text-indigo-500 font-semibold group-hover:underline">투표하러 가기 →</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <Link href="/polls">
                  <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-7 hover:shadow-md transition-shadow cursor-pointer group h-full flex flex-col justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className="text-rose-400" />
                      <span className="text-xs font-bold text-rose-400 tracking-widest uppercase">아파트 매치업</span>
                    </div>
                    <div>
                      <p className="text-lg font-extrabold text-slate-800 mb-1">아파트 밸런스 게임</p>
                      <p className="text-sm text-slate-500">어떤 단지가 더 끌리세요? 투표로 결정해요.</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-indigo-500 font-semibold group-hover:underline">
                      <Users size={14} />
                      투표 참여하기 →
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>

            {/* ── Block 4: 계산기 ── */}
            <motion.div
              variants={item}
              className="md:col-span-1 rounded-[2rem] p-7 flex flex-col justify-between gap-6 cursor-pointer"
              style={{ backgroundColor: "#4f46e5" }}
              onClick={() => setCalcOpen(true)}
              whileHover={{ scale: 1.02, boxShadow: "0 20px 48px -12px rgba(79,70,229,0.5)" }}
              whileTap={{ scale: 0.98 }}
              role="button"
            >
              <div>
                <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center mb-5">
                  <Calculator size={22} className="text-white" strokeWidth={2} />
                </div>
                <p className="text-xs font-bold text-indigo-300 tracking-widest uppercase mb-2">내집마련 계산기</p>
                <h3 className="text-xl font-extrabold text-white leading-snug">
                  내 월급으로<br />얼마짜리 집까지<br />살 수 있을까?
                </h3>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-sm font-semibold">
                지금 계산해보기
                <ArrowRight size={15} />
              </div>
            </motion.div>
          </motion.div>

          {/* 푸터 */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="text-center text-sm text-slate-400 font-medium mt-10"
          >
            무료 · 회원가입 없이 바로 시작
          </motion.p>
        </div>
      </main>

      <MortgageCalculator open={calcOpen} onClose={() => setCalcOpen(false)} />
    </>
  );
}