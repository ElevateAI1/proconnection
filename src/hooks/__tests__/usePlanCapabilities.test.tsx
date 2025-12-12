import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { TestWrapper } from '@/test/helpers';
import { usePlanCapabilities } from '../usePlanCapabilities';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: null },
        error: null,
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: {
          subscription: {
            unsubscribe: vi.fn(),
          },
        },
      }),
    },
  },
}));

// Mock useProfile
vi.mock('@/hooks/useProfile', () => ({
  useProfile: vi.fn(),
}));

describe('usePlanCapabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProfile).mockReturnValue({
      psychologist: { id: 'test-psychologist-id', plan_type: 'proconnection' },
      loading: false,
      forceRefresh: vi.fn(),
    } as any);
  });

  it('should return loading state initially', () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: null,
    });

    const { result } = renderHook(() => usePlanCapabilities(), {
      wrapper: TestWrapper,
    });

    expect(result.current.loading).toBe(true);
  });

  it('should fetch plan capabilities successfully', async () => {
    const mockCapabilities = {
      basic_features: true,
      seo_profile: true,
      advanced_reports: true,
      priority_support: true,
      financial_features: true,
      advanced_documents: false,
      team_features: false,
      early_access: false,
      visibility_consulting: false,
      api_integrations: false,
      dedicated_support: false,
    };

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockCapabilities,
      error: null,
    });

    const { result } = renderHook(() => usePlanCapabilities(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.hasCapability('seo_profile')).toBe(true);
    expect(result.current.hasCapability('basic_features')).toBe(true);
  });

  it('should correctly identify ProConnection user', async () => {
    const mockCapabilities = {
      basic_features: true,
      seo_profile: true,
      advanced_reports: true,
      priority_support: true,
      financial_features: true,
      advanced_documents: false,
      team_features: false,
      early_access: false,
      visibility_consulting: false,
      api_integrations: false,
      dedicated_support: false,
    };

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockCapabilities,
      error: null,
    });

    const { result } = renderHook(() => usePlanCapabilities(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.isProConnectionUser()).toBe(true);
    expect(result.current.isTeamsUser()).toBe(false);
  });

  it('should correctly identify Teams user', async () => {
    vi.mocked(useProfile).mockReturnValue({
      psychologist: { id: 'test-psychologist-id', plan_type: 'teams' },
      loading: false,
      forceRefresh: vi.fn(),
    } as any);

    const mockCapabilities = {
      basic_features: true,
      seo_profile: true,
      advanced_reports: true,
      priority_support: true,
      financial_features: true,
      advanced_documents: true,
      team_features: true,
      early_access: true,
      visibility_consulting: true,
      api_integrations: true,
      dedicated_support: true,
    };

    vi.mocked(supabase.rpc).mockResolvedValue({
      data: mockCapabilities,
      error: null,
    });

    const { result } = renderHook(() => usePlanCapabilities(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.isTeamsUser()).toBe(true);
    expect(result.current.isProConnectionUser()).toBe(false);
  });

  it('should handle fetch error gracefully', async () => {
    vi.mocked(supabase.rpc).mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    const { result } = renderHook(() => usePlanCapabilities(), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.hasCapability('seo_profile')).toBe(false);
  });

  it('should return false for capabilities when psychologist is not available', () => {
    vi.mocked(useProfile).mockReturnValue({
      psychologist: null,
      loading: false,
      forceRefresh: vi.fn(),
    } as any);

    const { result } = renderHook(() => usePlanCapabilities(), {
      wrapper: TestWrapper,
    });

    expect(result.current.hasCapability('seo_profile')).toBe(false);
    expect(result.current.isProConnectionUser()).toBe(false);
    expect(result.current.isTeamsUser()).toBe(false);
  });
});
