import { describe, it, expect, vi, beforeEach } from 'vitest';
import { errorResponse, successResponse, ApiError } from '@/lib/api/errors';

describe('lib/api/errors', () => {
  describe('errorResponse', () => {
    it('에러 JSON 응답을 생성한다', () => {
      const res = errorResponse('테스트 에러', 400);
      expect(res.status).toBe(400);
    });

    it('기본 상태 코드는 500이다', () => {
      const res = errorResponse('서버 에러');
      expect(res.status).toBe(500);
    });
  });

  describe('successResponse', () => {
    it('성공 JSON 응답을 생성한다', () => {
      const res = successResponse({ id: '1' });
      expect(res.status).toBe(200);
    });

    it('커스텀 상태 코드를 지정할 수 있다', () => {
      const res = successResponse({ id: '1' }, 201);
      expect(res.status).toBe(201);
    });
  });

  describe('ApiError', () => {
    it('커스텀 에러 클래스를 생성한다', () => {
      const err = new ApiError('Not found', 404);
      expect(err.message).toBe('Not found');
      expect(err.statusCode).toBe(404);
      expect(err.name).toBe('ApiError');
    });

    it('기본 상태 코드는 500이다', () => {
      const err = new ApiError('서버 에러');
      expect(err.statusCode).toBe(500);
    });
  });
});
