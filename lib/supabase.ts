import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
export interface Poll {
  id: string;
  title: string;
  created_at: string;
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

/* ─── 아파트 select 컬럼 목록 (공통) ─── */
export const APT_COLS =
  "danjiCode, danjiName, danjiType, sido, sigungu, eupMyeon, donglee, oldJuso, zipCode, newJuso, openDay, doungSu, sedaeSu, boiler, hallway, parkingLots, parkingLots_ratio";
