import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useOptimizedPatients } from '../useOptimizedPatients';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
    },
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock fetch for edge function
global.fetch = vi.fn();

describe('useOptimizedPatients', () => {
  const mockPsychologistId = 'test-psychologist-id';
  const mockPatient = {
    id: 'test-patient-id',
    first_name: 'Juan',
    last_name: 'Pérez',
    phone: '1234567890',
    age: 30,
    notes: 'Test notes',
    created_at: new Date().toISOString(),
    psychologist_id: mockPsychologistId,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: {
        session: {
          access_token: 'mock-token',
          user: { id: 'test-user' },
        },
      },
      error: null,
    });
  });

  it('should fetch patients successfully', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: [mockPatient],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    const { result } = renderHook(() => useOptimizedPatients(mockPsychologistId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.patients).toEqual([mockPatient]);
    expect(result.current.error).toBeNull();
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

    const { result } = renderHook(() => useOptimizedPatients(mockPsychologistId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.patients).toEqual([]);
    expect(result.current.error).toBeTruthy();
  });

  it('should add patient successfully', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: [mockPatient],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockPatient }),
    } as Response);

    const { result } = renderHook(() => useOptimizedPatients(mockPsychologistId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const addResult = await result.current.addPatient({
      first_name: 'Juan',
      last_name: 'Pérez',
      phone: '1234567890',
      age: 30,
      notes: 'Test notes',
    });

    expect(addResult).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/functions/v1/edge-function-proconnection/patients'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
        }),
      })
    );
  });

  it('should handle add patient error', async () => {
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockOrder = vi.fn().mockResolvedValue({
      data: [],
      error: null,
    });

    vi.mocked(supabase.from).mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
    } as any);

    vi.mocked(global.fetch).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'Failed to create patient' }),
    } as Response);

    const { result } = renderHook(() => useOptimizedPatients(mockPsychologistId));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const addResult = await result.current.addPatient({
      first_name: 'Juan',
      last_name: 'Pérez',
    });

    expect(addResult).toBe(false);
  });

  it('should return empty array when psychologistId is not provided', () => {
    const { result } = renderHook(() => useOptimizedPatients(undefined));

    expect(result.current.patients).toEqual([]);
    expect(result.current.loading).toBe(false);
  });
});

