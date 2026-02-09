"use client";
import { useState } from "react";
import { createLandlordReport, fetchLandlordReportById } from "../lib/api/landlordReport";
import LandlordReportComponent from "./LandlordReportComponent";

export default function LandlordReportDemo() {
  const [report, setReport] = useState<any | null>(null);
  const [address, setAddress] = useState("");
  const [fetchId, setFetchId] = useState("");
  const [fetchResult, setFetchResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 예시: 리포트 생성
  const handleCreate = async () => {
    setError(null);
    try {
      const newReport = await createLandlordReport({ address });
      setReport(newReport);
    } catch (e: any) {
      setError(e.message);
    }
  };

  // 예시: 리포트 id로 조회
  const handleFetch = async () => {
    setError(null);
    try {
      const data = await fetchLandlordReportById(fetchId);
      setFetchResult(data);
    } catch (e: any) {
      setError(e.message);
    }
  };

  return (
    <div style={{ border: "1px solid #ccc", padding: 16, margin: 16 }}>
      <h2>LandlordReport Supabase 연동 데모</h2>
      <div>
        <input value={address} onChange={e => setAddress(e.target.value)} placeholder="주소 입력" />
        <button onClick={handleCreate}>리포트 생성 (DB insert)</button>
      </div>
      {report && (
        <div style={{ marginTop: 16 }}>
          <div>생성된 리포트 id: <b>{report.id}</b></div>
          <LandlordReportComponent report={report} />
        </div>
      )}
      <hr />
      <div>
        <input value={fetchId} onChange={e => setFetchId(e.target.value)} placeholder="리포트 id로 조회" />
        <button onClick={handleFetch}>리포트 조회 (DB select)</button>
      </div>
      {fetchResult && (
        <div style={{ marginTop: 16 }}>
          <div>조회된 리포트 id: <b>{fetchResult.id}</b></div>
          <LandlordReportComponent report={fetchResult} />
        </div>
      )}
      {error && <div style={{ color: "red" }}>{error}</div>}
    </div>
  );
}
