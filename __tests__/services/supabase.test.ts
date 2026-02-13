import { describe, it, expect, vi } from 'vitest';

describe('services/supabase-server', () => {
  it('supabaseAdmin 모듈을 정상 import 할 수 있다', async () => {
    // 환경변수가 있을 때 정상 동작 확인
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key';

    vi.resetModules();
    const mod = await import('@/services/supabase-server');
    expect(mod.supabaseAdmin).toBeDefined();

    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  });
});

describe('services/supabase-auth', () => {
  it('getAuthUserId는 함수이다', async () => {
    const { getAuthUserId } = await import('@/services/supabase-auth');
    expect(typeof getAuthUserId).toBe('function');
  });

  it('createAuthClient는 함수이다', async () => {
    const { createAuthClient } = await import('@/services/supabase-auth');
    expect(typeof createAuthClient).toBe('function');
  });
});
