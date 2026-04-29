/**
 * 아파트 실거래가 병합 데이터 Supabase 업로드 스크립트
 * 실행: node --max-old-space-size=4096 scripts/seed-real-price.mjs
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, createReadStream } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { parse } from "csv-parse";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envRaw = readFileSync(join(__dirname, "../.env.local"), "utf-8");
const env = Object.fromEntries(
  envRaw.split("\n").filter((l) => l.includes("=")).map((l) => {
    const idx = l.indexOf("=");
    return [l.slice(0, idx).trim(), l.slice(idx + 1).trim()];
  })
);

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const csvPath = join(__dirname, "../data_apartment/realPrice_merged.csv");

const CHUNK_SIZE = 5000;

async function insertChunk(chunk, attempt = 1) {
    const { error } = await supabase.from('real_price_data').insert(chunk);
    if (error) {
        if (attempt <= 3) {
            console.warn(`    ⚠️ Insert failed. Retrying... (${attempt}/3)`);
            await new Promise(r => setTimeout(r, 2000 * attempt));
            return insertChunk(chunk, attempt + 1);
        } else {
            console.error(`    ❌ Insert permanently failed for this chunk:`, error.message);
            throw error;
        }
    }
}

async function main() {
  console.log("=== 아파트 실거래가 데이터 업로드 시작 ===");
  console.log(`목표 파일: ${csvPath}`);

  let chunk = [];
  let totalProcessed = 0;
  let successCount = 0;

  return new Promise((resolve, reject) => {
    const stream = createReadStream(csvPath)
      .pipe(parse({ columns: true, skip_empty_lines: true }))
      .on("data", async (row) => {
        
        // CSV values are strings, make sure empty values are handled
        const record = {
            danji_code: row.danji_code === '' ? null : row.danji_code,
            sigungu: row.sigungu,
            bunji: row.bunji,
            danji_name: row.danji_name,
            area_size: parseFloat(row.area_size) || null,
            contract_year_month: row.contract_year_month,
            contract_day: row.contract_day,
            price_krw: parseInt(row.price_krw, 10) || 0,
            floor: row.floor,
            build_year: row.build_year,
            road_name: row.road_name,
            cancel_date: row.cancel_date === '' ? null : row.cancel_date,
            trade_type: row.trade_type
        };

        chunk.push(record);
        totalProcessed++;

        if (chunk.length >= CHUNK_SIZE) {
            stream.pause(); // Pause reading while uploading
            const uploadChunk = [...chunk];
            chunk = [];
            
            insertChunk(uploadChunk)
                .then(() => {
                    successCount += uploadChunk.length;
                    console.log(`  ✓ Uploaded ${successCount} rows...`);
                    stream.resume();
                })
                .catch(err => {
                    console.error("Upload error stopping process.", err);
                    stream.destroy();
                    reject(err);
                });
        }
      })
      .on("end", async () => {
        if (chunk.length > 0) {
            try {
                await insertChunk(chunk);
                successCount += chunk.length;
                console.log(`  ✓ Uploaded ${successCount} rows...`);
            } catch (err) {
                console.error("Final chunk upload error.", err);
                return reject(err);
            }
        }
        console.log(`\n=== 업로드 완료 (총 ${successCount}건) ===`);
        resolve();
      })
      .on("error", (err) => {
          console.error("File reading error", err);
          reject(err);
      });
  });
}

main().catch(console.error);
