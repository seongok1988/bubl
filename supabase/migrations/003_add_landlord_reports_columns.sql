-- ============================================================
-- landlord_reports 테이블 컬럼 추가 마이그레이션
-- 설문 등록 기능 복구를 위해 필요한 컬럼 추가
-- ============================================================

-- landlord_reports 테이블에 설문 등록에 필요한 컬럼 추가
-- 기존 테이블에 없는 컬럼들을 IF NOT EXISTS로 안전하게 추가

-- address: 주소 정보
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'landlord_reports' AND column_name = 'address'
  ) THEN
    ALTER TABLE landlord_reports ADD COLUMN address text;
  END IF;
END
$$;

-- landlord_name: 임대인 이름 (코드에서 landlordName으로 사용)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'landlord_reports' AND column_name = 'landlord_name'
  ) THEN
    ALTER TABLE landlord_reports ADD COLUMN landlord_name text;
  END IF;
END
$$;

-- total_reviews: 총 리뷰 수
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'landlord_reports' AND column_name = 'total_reviews'
  ) THEN
    ALTER TABLE landlord_reports ADD COLUMN total_reviews integer DEFAULT 0;
  END IF;
END
$$;

-- recommendations: 추천 수
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'landlord_reports' AND column_name = 'recommendations'
  ) THEN
    ALTER TABLE landlord_reports ADD COLUMN recommendations integer DEFAULT 0;
  END IF;
END
$$;

-- warnings: 경고 수
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'landlord_reports' AND column_name = 'warnings'
  ) THEN
    ALTER TABLE landlord_reports ADD COLUMN warnings integer DEFAULT 0;
  END IF;
END
$$;

-- evaluation: 평가 데이터 (JSON)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'landlord_reports' AND column_name = 'evaluation'
  ) THEN
    ALTER TABLE landlord_reports ADD COLUMN evaluation jsonb;
  END IF;
END
$$;

-- reviews: 리뷰 배열 (JSON)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'landlord_reports' AND column_name = 'reviews'
  ) THEN
    ALTER TABLE landlord_reports ADD COLUMN reviews jsonb DEFAULT '[]'::jsonb;
  END IF;
END
$$;

-- user_notes: 사용자 메모
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'landlord_reports' AND column_name = 'user_notes'
  ) THEN
    ALTER TABLE landlord_reports ADD COLUMN user_notes text;
  END IF;
END
$$;

-- landlord_id를 nullable로 변경 (기존에는 NOT NULL이었으나 설문 등록 시 없을 수 있음)
-- 먼저 기존 NOT NULL constraint 제거
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'landlord_reports' AND column_name = 'landlord_id' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE landlord_reports ALTER COLUMN landlord_id DROP NOT NULL;
  END IF;
END
$$;

-- 스키마 캐시 갱신을 위해 NOTIFY 발송 (Supabase PostgREST 캐시 갱신)
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- 컬럼 추가 확인
-- ============================================================
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'landlord_reports'
ORDER BY ordinal_position;
