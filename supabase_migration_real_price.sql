-- Supabase SQL Migration for Real Price Data
-- Create the real_price_data table

CREATE TABLE IF NOT EXISTS public.real_price_data (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    danji_code VARCHAR(255),
    sigungu VARCHAR(255),
    bunji VARCHAR(255),
    danji_name VARCHAR(255),
    area_size NUMERIC,
    contract_year_month VARCHAR(10),
    contract_day VARCHAR(10),
    price_krw INTEGER,
    floor VARCHAR(10),
    build_year VARCHAR(10),
    road_name VARCHAR(255),
    cancel_date VARCHAR(255),
    trade_type VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: The foreign key is added but NOT enforced as NOT NULL because some records are unmapped.
-- Assuming apart_data has danjiCode as PRIMARY KEY or UNIQUE.
-- Alter table to add foreign key constraint (if apart_data exists and has danjiCode column)
-- ALTER TABLE public.real_price_data
-- ADD CONSTRAINT fk_danji_code
-- FOREIGN KEY (danji_code) 
-- REFERENCES public.apart_data (danjiCode)
-- ON DELETE SET NULL;

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_real_price_data_danji_code ON public.real_price_data(danji_code);
CREATE INDEX IF NOT EXISTS idx_real_price_data_contract_ym ON public.real_price_data(contract_year_month);
CREATE INDEX IF NOT EXISTS idx_real_price_data_sigungu ON public.real_price_data(sigungu);
