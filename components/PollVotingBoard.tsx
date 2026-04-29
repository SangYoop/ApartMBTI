"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { getSupabase, PollOptionWithApt } from "@/lib/supabase";
import ApartmentSummaryCard from "./ApartmentSummaryCard";

interface Props {
  pollId: string;
  initialOptions: PollOptionWithApt[];
}

export default function PollVotingBoard({ pollId, initialOptions }: Props) {
  const [options, setOptions] = useState(initialOptions);
  const [voted, setVoted] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`voted_${pollId}`);
  });

  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

  async function handleVote(optionId: string) {
    if (voted) return;

    const target = options.find((o) => o.id === optionId)!;

    // 낙관적 업데이트
    setOptions((prev) =>
      prev.map((o) =>
        o.id === optionId ? { ...o, vote_count: o.vote_count + 1 } : o
      )
    );
    setVoted(optionId);
    localStorage.setItem(`voted_${pollId}`, optionId);

    const { error } = await getSupabase()
      .from("poll_options")
      .update({ vote_count: target.vote_count + 1 })
      .eq("id", optionId);

    if (error) {
      // 롤백
      setOptions(initialOptions);
      setVoted(null);
      localStorage.removeItem(`voted_${pollId}`);
    }
  }

  return (
    <div className="space-y-4">
      {options.map((opt) => {
        const pct = totalVotes > 0 ? (opt.vote_count / totalVotes) * 100 : 0;
        const isMyVote = voted === opt.id;
        const isOther = voted !== null && !isMyVote;

        return (
          <div
            key={opt.id}
            onClick={() => !voted && handleVote(opt.id)}
            className={[
              "relative overflow-hidden rounded-2xl border-2 transition-colors",
              isMyVote
                ? "border-indigo-500"
                : isOther
                ? "border-slate-100"
                : "border-slate-100 hover:border-indigo-300 cursor-pointer",
            ].join(" ")}
          >
            {/* 투표 후 배경 게이지 */}
            {voted && (
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] as const }}
                className={[
                  "absolute inset-y-0 left-0 z-0",
                  isMyVote ? "bg-indigo-50" : "bg-slate-50",
                ].join(" ")}
              />
            )}

            <div className="relative z-10 p-5">
              {opt.apartment ? (
                <ApartmentSummaryCard apartment={opt.apartment} recentPrice={opt.recentPrice} />
              ) : (
                <p className="text-slate-400 text-sm">아파트 정보 없음</p>
              )}

              {/* 투표 결과 표시 */}
              {voted && (
                <div className="mt-3 flex items-center justify-between">
                  <span
                    className={`text-2xl font-extrabold ${
                      isMyVote ? "text-indigo-600" : "text-slate-400"
                    }`}
                  >
                    {Math.round(pct)}%
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isMyVote && (
                      <CheckCircle2 size={18} className="text-indigo-500" />
                    )}
                    <span className="text-sm text-slate-400">
                      {opt.vote_count.toLocaleString()}표
                    </span>
                  </div>
                </div>
              )}

              {/* 투표 전 안내 */}
              {!voted && (
                <p className="mt-3 text-sm font-semibold text-indigo-500">
                  클릭하여 투표 →
                </p>
              )}
            </div>
          </div>
        );
      })}

      <p className="text-center text-sm text-slate-400">
        {voted
          ? `총 ${totalVotes.toLocaleString()}명이 참여했어요`
          : "투표하면 실시간 결과를 볼 수 있어요"}
      </p>
    </div>
  );
}
