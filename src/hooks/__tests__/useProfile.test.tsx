import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useProfile } from '../useProfile';
import { supabase } from '@/integrations/supabase/client';

// Mock useAuth
const mockUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

vi.mock('../useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: mockUser,
    session: null,
    loading: false,
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  })),
}));

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('useProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null profile when user is not available', async () => {
    const { useAuth } = await import('../useAuth');
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toBeNull();
    expect(result.current.psychologist).toBeNull();
    expect(result.current.patient).toBeNull();
  });

  it('should fetch profile successfully', async () => {
    const mockProfile = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_type: 'psychologist' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockPsychologist = {
      id: 'test-user-id',
      first_name: 'Test',
      last_name: 'User',
      professional_code: 'PSY-001',
    };

    const mockFrom = vi.fn();
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn();

    mockFrom.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom);

    // First call for profile
    mockSingle.mockResolvedValueOnce({
      data: mockProfile,
      error: null,
    });

    // Second call for psychologist
    mockSingle.mockResolvedValueOnce({
      data: mockPsychologist,
      error: null,
    });

    const { result } = renderHook(() => useProfile());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.psychologist).toEqual(mockPsychologist);
    expect(result.current.patient).toBeNull();
  });

  it('should use cache when available and fresh', async () => {
    const mockProfile = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_type: 'psychologist' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // First render to populate cache
    const mockFrom = vi.fn();
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    mockFrom.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const { result, rerender } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mocks
    vi.clearAllMocks();

    // Rerender - should use cache
    rerender();

    // Should not call supabase again (cache is fresh)
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('should handle profile fetch error', async () => {
    const mockError = {
      message: 'Profile not found',
      code: 'PGRST116',
    };

    const mockFrom = vi.fn();
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: null,
      error: mockError,
    });

    mockFrom.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Error cargando perfil');
    expect(result.current.profile).toBeNull();
  });

  it('should fetch patient profile when user_type is patient', async () => {
    const mockProfile = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_type: 'patient' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockPatient = {
      id: 'test-user-id',
      first_name: 'Test',
      last_name: 'Patient',
      psychologist_id: 'psych-id',
    };

    const mockFrom = vi.fn();
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn();

    mockFrom.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom);

    // First call for profile
    mockSingle.mockResolvedValueOnce({
      data: mockProfile,
      error: null,
    });

    // Second call for patient
    mockSingle.mockResolvedValueOnce({
      data: mockPatient,
      error: null,
    });

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.patient).toEqual(mockPatient);
    expect(result.current.psychologist).toBeNull();
  });

  it('should force refresh and invalidate cache', async () => {
    const mockProfile = {
      id: 'test-user-id',
      email: 'test@example.com',
      user_type: 'psychologist' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const mockFrom = vi.fn();
    const mockSelect = vi.fn().mockReturnThis();
    const mockEq = vi.fn().mockReturnThis();
    const mockSingle = vi.fn().mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    mockFrom.mockReturnValue({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
    });

    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const { result } = renderHook(() => useProfile());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mocks
    vi.clearAllMocks();
    mockSingle.mockResolvedValue({
      data: mockProfile,
      error: null,
    });

    // Force refresh
    result.current.forceRefresh();

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have called supabase again
    expect(supabase.from).toHaveBeenCalled();
  });
});

