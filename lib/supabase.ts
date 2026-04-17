import { createClient, SupabaseClient } from "@supabase/supabase-js";

let _client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!_client) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) throw new Error("Supabase env vars missing");
    _client = createClient(url, key);
  }
  return _client;
}

/* ─── apartData 테이블 ─── */
export interface Apartment {
  danjiCode: string;
  danjiName: string;
  danjiType: string | null;
  sido: string;
  sigungu: string;
  eupMyeon: string | null;
  donglee: string | null;
  oldJuso: string | null;
  zipCode: string | null;
  newJuso: string | null;
  openDay: string | null;   // date → string (ISO)
  doungSu: number | null;
  sedaeSu: number | null;
  boiler: string | null;
  hallway: string | null;
  parkingLots: number | null;
  parkingLots_ratio: number | null;
}

/* ─── polls ─── */
export type TransactionType = "매매" | "전세";

export interface Poll {
  id: string;
  title: string;
  created_at: string;
  region: string | null;
  budget: number | null;
  transaction_type: TransactionType | null;
}

export function formatBudget(억: number): string {
  if (억 < 1) {
    const 만 = Math.round(억 * 10000);
    return `${만.toLocaleString()}만원`;
  }
  const 억단위 = Math.floor(억);
  const 나머지만 = Math.round((억 - 억단위) * 10000);
  if (나머지만 === 0) return `${억단위}억원`;
  return `${억단위}억 ${나머지만.toLocaleString()}만원`;
}

/* ─── poll_options ─── */
export interface PollOption {
  id: string;
  poll_id: string;
  apartment_id: string;
  vote_count: number;
}

export type PollOptionWithApt = PollOption & { apartment: Apartment | undefined };

/* ─── poll_comments ─── */
export interface PollComment {
  id: string;
  poll_id: string;
  content: string;
  created_at: string;
  author_name: string;
}

/* ─── quiz_results ─── */
export interface QuizResult {
  id: string;
  result_type: string;
  created_at: string;
}

/* ─── 아파트 select 컬럼 목록 (공통) ─── */
export const APT_COLS =
  "danjiCode, danjiName, danjiType, sido, sigungu, eupMyeon, donglee, oldJuso, zipCode, newJuso, openDay, doungSu, sedaeSu, boiler, hallway, parkingLots, parkingLots_ratio";
