"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Send, MapPin, Wallet } from "lucide-react";
import {
  getSupabase,
  formatBudget,
  Poll,
  PollOption,
  PollOptionWithApt,
  PollComment,
  Apartment,
  APT_COLS,
} from "@/lib/supabase";
import PollVotingBoard from "@/components/PollVotingBoard";

export default function PollDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const [poll, setPoll] = useState<Poll | null>(null);
  const [options, setOptions] = useState<PollOptionWithApt[]>([]);
  const [comments, setComments] = useState<PollComment[]>([]);
  const [loading, setLoading] = useState(true);

  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchAll() {
      const [{ data: pollData }, { data: optionsData }, { data: commentsData }] =
        await Promise.all([
          getSupabase().from("polls").select("*").eq("id", id).single(),
          getSupabase().from("poll_options").select("*").eq("poll_id", id),
          getSupabase()
            .from("poll_comments")
            .select("*")
            .eq("poll_id", id)
            .order("created_at", { ascending: true }),
        ]);

      if (!pollData || !optionsData) {
        setLoading(false);
        return;
      }

      const aptIds = (optionsData as PollOption[]).map((o) => o.apartment_id);
      const { data: apartments } = await getSupabase()
        .from("apartData")
        .select(APT_COLS)
        .in("danjiCode", aptIds);

      const aptMap = new Map(
        ((apartments as Apartment[]) ?? []).map((a) => [a.danjiCode, a])
      );

      setPoll(pollData as Poll);
      setOptions(
        (optionsData as PollOption[]).map((o) => ({
          ...o,
          apartment: aptMap.get(o.apartment_id),
        }))
      );
      setComments((commentsData as PollComment[]) ?? []);
      setLoading(false);
    }

    fetchAll();
  }, [id]);

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !authorName.trim()) return;
    setSubmitting(true);

    const { data: newComment } = await getSupabase()
      .from("poll_comments")
      .insert({
        poll_id: id,
        content: content.trim(),
        author_name: authorName.trim(),
      })
      .select()
      .single();

    if (newComment) {
      setComments((prev) => [...prev, newComment as PollComment]);
      setContent("");
    }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
        <p className="text-slate-400 font-medium">투표를 찾을 수 없습니다.</p>
        <Link href="/polls">
          <button className="bg-indigo-600 text-white rounded-full px-6 py-3 text-sm font-semibold">
            목록으로
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 pb-24">
      {/* 헤더 */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-xl mx-auto px-4 pt-4 flex items-center gap-3">
          <Link href="/polls" className="p-2 rounded-full hover:bg-slate-100 transition-colors shrink-0">
            <ArrowLeft size={18} className="text-slate-500" />
          </Link>
          <h1 className="font-extrabold text-slate-900 text-base flex-1 truncate">{poll.title}</h1>
        </div>
        {(poll.region || poll.budget) && (
          <div className="max-w-xl mx-auto px-4 pb-3 pt-2 flex flex-wrap gap-1.5">
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
        {!poll.region && !poll.budget && <div className="pb-1" />}
      </header>

      <div className="max-w-xl mx-auto px-4 py-6 space-y-10">
        {/* 투표 보드 */}
        <section>
          <PollVotingBoard pollId={id} initialOptions={options} />
        </section>

        <div className="border-t border-slate-100" />

        {/* 댓글 섹션 */}
        <section className="space-y-4">
          <h2 className="font-extrabold text-slate-900 text-lg">
            댓글{" "}
            <span className="text-indigo-500 text-base">{comments.length}</span>
          </h2>

          {/* 댓글 목록 */}
          <div className="space-y-3">
            {comments.length === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">
                첫 번째 댓글을 남겨보세요!
              </p>
            )}
            {comments.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-slate-100 p-4"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-slate-800">
                    {c.author_name}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(c.created_at).toLocaleDateString("ko-KR", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {c.content}
                </p>
              </motion.div>
            ))}
          </div>

          {/* 댓글 입력 폼 */}
          <form onSubmit={handleComment} className="space-y-2">
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              placeholder="닉네임 (익명 가능)"
              className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <div className="flex gap-2">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="의견을 남겨보세요"
                className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={submitting || !content.trim() || !authorName.trim()}
                className="bg-indigo-600 disabled:bg-slate-200 text-white disabled:text-slate-400 rounded-xl px-4 py-3 transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
