-- landlord_reports risk_flag 컬럼 안전 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name='landlord_reports'
        AND column_name='risk_flag'
    ) THEN
        ALTER TABLE landlord_reports
        ADD COLUMN risk_flag boolean DEFAULT false;
    END IF;
END
$$;
