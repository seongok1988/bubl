// ============================================================
// API 에러 처리 유틸리티 (lib/api/errors.ts)
// API Route에서 일관된 에러 응답을 생성합니다.
// ============================================================

import { NextResponse } from 'next/server';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * 일관된 에러 JSON 응답을 생성합니다.
 */
export function errorResponse(message: string, status: number = 500) {
  return NextResponse.json({ error: message }, { status });
}

/**
 * 일관된 성공 JSON 응답을 생성합니다.
 */
export function successResponse<T>(data: T, status: number = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

/**
 * API Route 핸들러를 try-catch로 래핑합니다.
 */
export function withErrorHandler(
  handler: (req: Request) => Promise<NextResponse>
) {
  return async (req: Request) => {
    try {
      return await handler(req);
    } catch (err) {
      if (err instanceof ApiError) {
        return errorResponse(err.message, err.statusCode);
      }
      console.error('[API Error]', err);
      return errorResponse('서버 오류가 발생했습니다.');
    }
  };
}
