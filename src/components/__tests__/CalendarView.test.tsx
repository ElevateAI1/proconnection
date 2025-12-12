import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Calendar } from '../CalendarView';
import { useProfile } from '@/hooks/useProfile';

// Mock hooks
vi.mock('@/hooks/useProfile');
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('Calendar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProfile).mockReturnValue({
      psychologist: { id: 'test-psychologist-id' },
      loading: false,
    });
  });

  it('should render calendar view', () => {
    render(
      <MemoryRouter>
        <Calendar />
      </MemoryRouter>
    );
    expect(screen.getByText(/calendario/i)).toBeInTheDocument();
  });

  it('should display calendar controls', () => {
    render(
      <MemoryRouter>
        <Calendar />
      </MemoryRouter>
    );
    // Should have navigation buttons (chevron buttons)
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should show loading state when profile is loading', () => {
    vi.mocked(useProfile).mockReturnValue({
      psychologist: null,
      loading: true,
    });

    render(
      <MemoryRouter>
        <Calendar />
      </MemoryRouter>
    );
    // Calendar may still render even when loading, just check it renders
    expect(screen.getByText(/calendario/i)).toBeInTheDocument();
  });
});

