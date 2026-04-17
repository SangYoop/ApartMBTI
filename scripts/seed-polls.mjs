/**
 * 아파트 밸런스 게임 초기 데이터 시드 스크립트
 * 실행: node scripts/seed-polls.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envRaw = readFileSync(join(__dirname, "../.env.local"), "utf-8");
const env = Object.fromEntries(
  envRaw.split("\n").filter((l) => l.includes("=")).map((l) => {
    const idx = l.indexOf("=");
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
  })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 단지명 + 선택적 sigungu 필터로 danjiCode 검색 */
async function findApt(keyword, sigungu = null) {
  let req = supabase
    .from("apartData")
    .select("danjiCode, danjiName, sido, sigungu")
    .ilike("danjiName", `%${keyword}%`);
  if (sigungu) req = req.eq("sigungu", sigungu);
  const { data } = await req.limit(1);
  if (!data || data.length === 0) {
    console.warn(`  ⚠️  못 찾음: "${keyword}" (${sigungu ?? "전국"})`);
    return null;
  }
  console.log(`  ✓  "${keyword}" → ${data[0].danjiName} (${data[0].sigungu})`);
  return data[0];
}

const SEED = [
  {
    title: "6억 초반 용인 매매! 판교/선정릉 출퇴근 직장인, 어디가 최선일까요? ㅠㅠ",
    region: "경기",
    budget: 6.2,
    transaction_type: "매매",
    apts: [
      { keyword: "새터마을모아미래도", sigungu: "용인수지구" },
      { keyword: "동일하이빌1차", sigungu: "용인기흥구" },
      { keyword: "기흥파크뷰", sigungu: "용인기흥구" },
    ],
    comments: [
      { author: "가자판교로(익명)", content: "판교가 직장이시면 닥 구성 마북동 쪽이죠. GTX 개통 빨 무시 못 합니다. 동일하이빌 한 표요!" },
      { author: "초보새댁(익명)", content: "선정릉 출퇴근이면 무조건 죽전이 편해요 ㅠㅠ 수인분당선 쭉 타고 가는 거랑 갈아타는 거랑 피로도가 다릅니다. 새터마을 상권도 살기 좋아요." },
      { author: "임장매니아(익명)", content: "6억 초반이시면 구성 우림도 한 번 다시 봐보세요. 구축이긴 해도 구성역 도보권이라 가성비 메리트가 확실합니다." },
      { author: "GTX기원(익명)", content: "5년 뒤 매도까지 생각하신다면 B 구성 하마비마을 추천! 실거주 퀄리티를 최우선하면 A 죽전이 낫습니다." },
    ],
  },
];

async function main() {
  console.log("=== 아파트 밸런스 게임 시드 시작 ===\n");

  for (const poll of SEED) {
    console.log(`\n📌 [${poll.region}] ${poll.title}`);

    const apts = await Promise.all(poll.apts.map(({ keyword, sigungu }) => findApt(keyword, sigungu)));
    if (apts.some((a) => a === null)) {
      console.log("  → 아파트를 찾지 못해 건너뜁니다.\n");
      continue;
    }

    const { data: pollData, error: pollErr } = await supabase
      .from("polls")
      .insert({
        title: poll.title,
        region: poll.region,
        budget: poll.budget,
        transaction_type: poll.transaction_type,
      })
      .select()
      .single();

    if (pollErr || !pollData) {
      console.error("  ✗ 투표 생성 실패:", pollErr?.message);
      continue;
    }

    const { error: optErr } = await supabase.from("poll_options").insert(
      apts.map((apt) => ({
        poll_id: pollData.id,
        apartment_id: apt.danjiCode,
        vote_count: rand(5, 15),
      }))
    );
    if (optErr) { console.error("  ✗ 선택지 실패:", optErr.message); continue; }

    const now = Date.now();
    const { error: cmtErr } = await supabase.from("poll_comments").insert(
      poll.comments.map((c, i) => ({
        poll_id: pollData.id,
        author_name: c.author,
        content: c.content,
        created_at: new Date(now - (poll.comments.length - i) * rand(600000, 3600000)).toISOString(),
      }))
    );
    if (cmtErr) { console.error("  ✗ 댓글 실패:", cmtErr.message); continue; }

    console.log(`  → 완료 (선택지 ${apts.length}개, 댓글 ${poll.comments.length}개)`);
  }

  console.log("\n=== 시드 완료 ===");
}

main().catch(console.error);