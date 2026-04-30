-- Add area_types JSONB column to apartData
-- Each row stores [{pyeong, sqm, households}, ...] sorted by pyeong asc
ALTER TABLE "apartData" ADD COLUMN IF NOT EXISTS area_types JSONB;

-- Add pyeong column to poll_options (stores the selected area type for the option)
ALTER TABLE poll_options ADD COLUMN IF NOT EXISTS pyeong INTEGER;
