import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { TestWrapper } from '@/test/helpers';
import { usePaymentReceipts } from '../usePaymentReceipts';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
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

describe('usePaymentReceipts', () => {
  const mockPsychologistId = 'test-psychologist-id';
  const mockReceipts = [
    {
      id: '1',
      psychologist_id: mockPsychologistId,
      amount: 10000,
      receipt_date: new Date().toISOString(),
      validation_status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      psychologist_id: mockPsychologistId,
      amount: 15000,
      receipt_date: new Date().toISOString(),
      validation_status: 'approved',
      created_at: new Date().toISOString(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch receipts successfully', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: mockReceipts,
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    const { result } = renderHook(() => usePaymentReceipts(mockPsychologistId), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.receipts.length).toBeGreaterThan(0);
    });

    expect(result.current.receipts).toEqual(mockReceipts);
  });

  it('should handle fetch error', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: null,
      error: { message: 'Database error' },
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    const { result } = renderHook(() => usePaymentReceipts(mockPsychologistId), {
      wrapper: TestWrapper,
    });

    await waitFor(() => {
      expect(result.current.receipts).toEqual([]);
    });
  });

  it('should return empty array when psychologistId is not provided', () => {
    const { result } = renderHook(() => usePaymentReceipts(undefined), {
      wrapper: TestWrapper,
    });

    expect(result.current.receipts).toEqual([]);
  });
});

