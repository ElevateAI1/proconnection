import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PlanGate } from '../PlanGate';
import { usePlanCapabilities } from '@/hooks/usePlanCapabilities';

// Mock hooks
vi.mock('@/hooks/usePlanCapabilities');

describe('PlanGate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render children when user has capability', () => {
    vi.mocked(usePlanCapabilities).mockReturnValue({
      hasCapability: vi.fn(() => true),
      loading: false,
      isProConnectionUser: vi.fn(() => true),
      isTeamsUser: vi.fn(() => false),
      isDevUser: vi.fn(() => false),
      hasTierOrHigher: vi.fn(() => true),
    });

    render(
      <PlanGate capability="seo_profile">
        <div>Protected Content</div>
      </PlanGate>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should show upgrade message when user lacks capability', () => {
    vi.mocked(usePlanCapabilities).mockReturnValue({
      hasCapability: vi.fn(() => false),
      loading: false,
      isProConnectionUser: vi.fn(() => false),
      isTeamsUser: vi.fn(() => false),
      isDevUser: vi.fn(() => false),
      hasTierOrHigher: vi.fn(() => false),
    });

    render(
      <PlanGate capability="seo_profile">
        <div>Protected Content</div>
      </PlanGate>
    );

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(screen.getByText(/SEO de Perfil Profesional/i)).toBeInTheDocument();
    expect(screen.getByText(/Ver Planes/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.mocked(usePlanCapabilities).mockReturnValue({
      hasCapability: vi.fn(() => false),
      loading: true,
      isProConnectionUser: vi.fn(() => false),
      isTeamsUser: vi.fn(() => false),
      isDevUser: vi.fn(() => false),
      hasTierOrHigher: vi.fn(() => false),
    });

    render(
      <PlanGate capability="seo_profile">
        <div>Protected Content</div>
      </PlanGate>
    );

    // Should show loading skeleton
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should show correct tier name for Teams plan', () => {
    vi.mocked(usePlanCapabilities).mockReturnValue({
      hasCapability: vi.fn(() => false),
      loading: false,
      isProConnectionUser: vi.fn(() => false),
      isTeamsUser: vi.fn(() => false),
      isDevUser: vi.fn(() => false),
      hasTierOrHigher: vi.fn(() => false),
    });

    render(
      <PlanGate capability="team_features">
        <div>Protected Content</div>
      </PlanGate>
    );

    expect(screen.getAllByText(/Plan Teams/i).length).toBeGreaterThan(0);
  });
});

