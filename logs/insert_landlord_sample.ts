import { createLandlordReport } from "../lib/api/landlordReport.ts";

async function insertSample() {
  const sample = {
    address: "이태원동 400번지",
    evaluation: {
      score: 4.5,
      summary: "조용하고 관리가 잘 되는 건물입니다. 집주인도 친절합니다."
    },
    reviews: [
      {
        author: "홍길동",
        content: "집주인이 수리 요청에 빠르게 응답해줬어요.",
        date: "2026-02-11"
      },
      {
        author: "김영희",
        content: "동네가 안전하고 깨끗합니다.",
        date: "2026-02-10"
      }
    ],
    positiveTraits: ["친절함", "응답 빠름", "청결"],
    negativeTraits: ["주차 공간 부족"]
  };
  try {
    const result = await createLandlordReport(sample);
    console.log("샘플 데이터 입력 완료:", result);
  } catch (e) {
    console.error("샘플 데이터 입력 실패:", e);
  }
}

insertSample();
