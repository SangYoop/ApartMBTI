"use client";

import Link from "next/link";
import { ChevronRight, Users, MapPin, Wallet } from "lucide-react";
import { Poll, PollOptionWithApt, formatBudget } from "@/lib/supabase";

interface Props {
  poll: Poll;
  options: PollOptionWithApt[];
}

export default function PollFeedCard({ poll, options }: Props) {
  const totalVotes = options.reduce((sum, o) => sum + o.vote_count, 0);

  return (
    <Link href={`/polls/${poll.id}`}>
      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-shadow p-5 cursor-pointer group">
        {/* 제목 */}
        <div className="flex items-start gap-2 mb-3">
          <h3 className="flex-1 font-bold text-slate-900 text-base leading-snug">
            {poll.title}
          </h3>
          <ChevronRight
            size={18}
            className="shrink-0 mt-0.5 text-slate-300 group-hover:text-indigo-500 transition-colors"
          />
        </div>

        {/* 지역 · 예산 뱃지 */}
        {(poll.region || poll.budget) && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {poll.region && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-indigo-50 text-indigo-600 px-2.5 py-1 rounded-full">
                <MapPin size={10} />
                {poll.region}
              </span>
            )}
            {poll.budget && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                <Wallet size={10} />
                {formatBudget(poll.budget)}
              </span>
            )}
          </div>
        )}

        {/* 아파트 카드 그리드 */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {options.map((opt) => {
            const pct =
              totalVotes > 0
                ? Math.round((opt.vote_count / totalVotes) * 100)
                : null;
            return (
              <div
                key={opt.id}
                className="bg-slate-50 rounded-xl p-3 border border-slate-100"
              >
                <p className="text-sm font-bold text-slate-800 truncate">
                  {opt.apartment?.danjiName ?? "알 수 없음"}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 truncate">
                  {opt.apartment?.sigungu ?? "-"}
                </p>
                {pct !== null && (
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-indigo-600">{pct}%</span>
                      <span className="text-slate-400">{opt.vote_count}표</span>
                    </div>
                    <div className="h-1 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 푸터 */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Users size={12} />
          <span>{totalVotes.toLocaleString()}명 참여</span>
          <span className="ml-auto">
            {new Date(poll.created_at).toLocaleDateString("ko-KR")}
          </span>
        </div>
      </div>
    </Link>
  );
}
