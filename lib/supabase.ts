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

export type PollOptionWithApt = PollOption & {
  apartment: Apartment | undefined;
  recentPrice: RealPrice | null | undefined;
};

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

/* ─── real_price_data 테이블 ─── */
export interface RealPrice {
  danji_code: string;
  contract_year_month: string;
  contract_day: string | null;
  area_size: number | null;
  floor: string | null;
  price_krw: number | null;
}

export const REAL_PRICE_COLS =
  "danji_code, contract_year_month, contract_day, area_size, floor, price_krw";

/** "202503" → "2025.03" */
export function formatContractYM(ym: string): string {
  const s = ym.replace(/\D/g, "");
  if (s.length >= 6) return `${s.slice(0, 4)}.${s.slice(4, 6)}`;
  return ym;
}

/** 84.92 → "전용 25.7평" */
export function formatAreaSize(sqm: number): string {
  const pyeong = Math.round(sqm * 0.3025 * 10) / 10;
  return `전용 ${pyeong}평`;
}

/** 각 danjiCode 별 가장 최근 거래 1건을 Map으로 반환 */
export async function fetchRecentPrices(
  danjiCodes: string[]
): Promise<Map<string, RealPrice>> {
  if (danjiCodes.length === 0) return new Map();

  const { data } = await getSupabase()
    .from("real_price_data")
    .select(REAL_PRICE_COLS)
    .in("danji_code", danjiCodes)
    .order("contract_year_month", { ascending: false })
    .order("contract_day", { ascending: false })
    .limit(danjiCodes.length * 10);

  const map = new Map<string, RealPrice>();
  for (const row of (data as RealPrice[]) ?? []) {
    if (!map.has(row.danji_code)) map.set(row.danji_code, row);
  }
  return map;
}
