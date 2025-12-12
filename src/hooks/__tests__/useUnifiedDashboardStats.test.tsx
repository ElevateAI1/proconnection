import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { TestWrapper } from '@/test/helpers';
import { useUnifiedDashboardStats } from '../useUnifiedDashboardStats';
import { supabase } from '@/integrations/supabase/client';

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

describe('useUnifiedDashboardStats', () => {
  const mockPsychologistId = 'test-psychologist-id';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useUnifiedDashboardStats(mockPsychologistId), {
      wrapper: TestWrapper,
    });

    expect(result.current.profileLoading).toBe(true);
    expect(result.current.statsLoading).toBe(true);
  });

  it('should fetch dashboard stats successfully', async () => {
    const mockPsychologist = {
      first_name: 'Dr. Test',
      last_name: 'User',
      plan_type: 'proconnection',
      subscription_status: 'active',
    };

    const mockAppointments = [{ id: '1' }, { id: '2' }];
    const mockPatients = [{ id: '1' }, { id: '2' }, { id: '3' }];

    vi.mocked(supabase.from).mockImplementation((table: string) => {
      if (table === 'psychologists') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({
            data: mockPsychologist,
            error: null,
          }),
        } as any;
      }
      if (table === 'appointments') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          gte: vi.fn().mockReturnThis(),
          lt: vi.fn().mockReturnThis(),
          in: vi.fn().mockResolvedValue({
            count: mockAppointments.length,
            error: null,
          }),
        } as any;
      }
      if (table === 'patients') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockResolvedValue({
            count: mockPatients.length,
            error: null,
          }),
        } as any;
      }
      return {} as any;
    });

    const { result } = renderHook(() => useUnifiedDashboardStats(mockPsychologistId), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.profileLoading).toBe(false);
      expect(result.current.statsLoading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.psychologistName).toBe('Dr. Test User');
    expect(result.current.planType).toBe('proconnection');
    expect(result.current.todayAppointments).toBe(2);
    expect(result.current.activePatients).toBe(3);
  });

  it('should handle fetch error', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Database error' },
      }),
    } as any);

    const { result } = renderHook(() => useUnifiedDashboardStats(mockPsychologistId), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.profileLoading).toBe(false);
    }, { timeout: 3000 });

    expect(result.current.error).toBeTruthy();
  });

  it('should return default values when psychologistId is not provided', () => {
    const { result } = renderHook(() => useUnifiedDashboardStats(undefined), {
      wrapper: TestWrapper,
    });

    expect(result.current.psychologistName).toBe('');
    expect(result.current.planType).toBe('');
    expect(result.current.profileLoading).toBe(false);
    expect(result.current.statsLoading).toBe(false);
  });
});
