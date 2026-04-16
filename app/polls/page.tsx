"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, Home } from "lucide-react";
import { getSupabase, Poll, PollOption, PollOptionWithApt, Apartment, APT_COLS } from "@/lib/supabase";
import PollFeedCard from "@/components/PollFeedCard";

type PollWithOptions = Poll & { poll_options: PollOptionWithApt[] };

export default function PollsPage() {
  const [polls, setPolls] = useState<PollWithOptions[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPolls() {
      const { data: pollsData } = await getSupabase()
        .from("polls")
        .select("*, poll_options(*)")
        .order("created_at", { ascending: false });

      if (!pollsData) {
        setLoading(false);
        return;
      }

      // 필요한 danjiCode 목록 수집
      const aptIds = [
        ...new Set(
          pollsData.flatMap((p) =>
            (p.poll_options as PollOption[]).map((o) => o.apartment_id)
          )
        ),
      ];

      const { data: apartments } =
        aptIds.length > 0
          ? await getSupabase()
              .from("apartData")
              .select(APT_COLS)
              .in("danjiCode", aptIds)
          : { data: [] };

      const aptMap = new Map(
        ((apartments as Apartment[]) ?? []).map((a) => [a.danjiCode, a])
      );

      setPolls(
        pollsData.map((p) => ({
          ...p,
          poll_options: (p.poll_options as PollOption[]).map((o) => ({
            ...o,
            apartment: aptMap.get(o.apartment_id),
          })),
        }))
      );
      setLoading(false);
    }

    fetchPolls();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <Home size={18} className="text-slate-500" />
            </Link>
            <h1 className="font-extrabold text-slate-900 text-lg">
              아파트 VS 투표
            </h1>
          </div>
          <Link href="/polls/create">
            <button className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-4 py-2 text-sm font-semibold transition-colors">
              <Plus size={15} strokeWidth={2.5} />
              새 투표
            </button>
          </Link>
        </div>
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-4">
        {/* 로딩 */}
        {loading && (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* 빈 상태 */}
        {!loading && polls.length === 0 && (
          <div className="text-center py-24 space-y-3">
            <p className="text-slate-400 font-medium">아직 투표가 없어요</p>
            <p className="text-sm text-slate-400">첫 번째 투표를 만들어보세요!</p>
            <Link href="/polls/create">
              <button className="mt-2 bg-indigo-600 text-white rounded-full px-6 py-3 text-sm font-semibold">
                투표 만들기
              </button>
            </Link>
          </div>
        )}

        {/* 피드 */}
        {polls.map((poll, i) => (
          <motion.div
            key={poll.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06, duration: 0.4 }}
          >
            <PollFeedCard poll={poll} options={poll.poll_options} />
          </motion.div>
        ))}
      </div>
    </main>
  );
}
