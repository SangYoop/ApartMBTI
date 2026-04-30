/**
 * 단지 면적정보 → apartData.area_types 업데이트 스크립트
 * 실행: node scripts/seed-area-types.mjs
 *
 * 로직:
 *  1. xlsx 파일에서 단지코드 / 주거전용면적(세부) / 세대수 읽기
 *  2. 같은 단지코드 내에서 Math.floor(sqm * 0.3025) 기준으로 평형 그룹화
 *  3. 동일 평형은 세대수 합산, 면적은 평균
 *  4. apartData 테이블 area_types 컬럼 batch 업데이트 (동시 20건)
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import XLSX from "xlsx";

const __dirname = dirname(fileURLToPath(import.meta.url));

const envRaw = readFileSync(join(__dirname, "../.env.local"), "utf-8");
const env = Object.fromEntries(
  envRaw.split("\n").filter((l) => l.includes("=")).map((l) => {
    const idx = l.indexOf("=");
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
  })
);

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const CONCURRENCY = 20;
const XLSX_PATH = join(__dirname, "../data_apartment/20260424_단지_면적정보.xlsx");

// COL indices (row[1] = headers)
const COL = { DANJI_CODE: 4, SQM: 9, HOUSEHOLDS: 10 };

async function main() {
  console.log("=== 단지 면적정보 → area_types 업데이트 시작 ===");

  // 1. xlsx 읽기
  const wb = XLSX.readFile(XLSX_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });
  // row[0] = 안내문구, row[1] = 헤더, row[2+] = 데이터
  const dataRows = rows.slice(2);
  console.log(`읽기 완료: ${dataRows.length}행`);

  // 2. 단지코드별 평형 집계
  // Map<danjiCode, Map<pyeong, {sqm_sum, households, count}>>
  const danjiMap = new Map();

  for (const row of dataRows) {
    const danjiCode = row[COL.DANJI_CODE];
    const sqm = parseFloat(row[COL.SQM]);
    const households = parseInt(row[COL.HOUSEHOLDS], 10) || 0;

    if (!danjiCode || isNaN(sqm) || sqm <= 0) continue;

    const pyeong = Math.floor(sqm * 0.3025);

    if (!danjiMap.has(danjiCode)) danjiMap.set(danjiCode, new Map());
    const pm = danjiMap.get(danjiCode);

    if (!pm.has(pyeong)) pm.set(pyeong, { sqm_sum: 0, households: 0, count: 0 });
    const e = pm.get(pyeong);
    e.sqm_sum += sqm;
    e.households += households;
    e.count += 1;
  }

  console.log(`유니크 단지 수: ${danjiMap.size}`);

  // 3. 최종 포맷으로 변환
  const updates = [];
  for (const [danjiCode, pm] of danjiMap) {
    const area_types = [...pm.entries()]
      .map(([pyeong, e]) => ({
        pyeong,
        sqm: Math.round((e.sqm_sum / e.count) * 100) / 100,
        households: e.households,
      }))
      .sort((a, b) => a.pyeong - b.pyeong);
    updates.push({ danjiCode, area_types });
  }

  // 4. Supabase batch 업데이트
  console.log(`업데이트 시작 (${updates.length}건, 동시 ${CONCURRENCY}건)...`);
  let done = 0;
  let errors = 0;

  for (let i = 0; i < updates.length; i += CONCURRENCY) {
    const batch = updates.slice(i, i + CONCURRENCY);
    await Promise.all(
      batch.map(async ({ danjiCode, area_types }) => {
        const { error } = await supabase
          .from("apartData")
          .update({ area_types })
          .eq("danjiCode", danjiCode);
        if (error) {
          errors++;
          if (errors <= 5) console.error(`  ❌ ${danjiCode}:`, error.message);
        } else {
          done++;
        }
      })
    );

    const processed = Math.min(i + CONCURRENCY, updates.length);
    if (processed % 1000 < CONCURRENCY || processed === updates.length) {
      console.log(`  진행: ${processed}/${updates.length} (오류: ${errors})`);
    }
  }

  console.log(`\n=== 완료: 성공 ${done}건, 오류 ${errors}건 ===`);
}

main().catch(console.error);
