import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { PatientManagement } from '../PatientManagement';
import { useOptimizedPatients } from '@/hooks/useOptimizedPatients';

// Mock hooks
vi.mock('@/hooks/useOptimizedPatients');
vi.mock('@/hooks/useProfile', () => ({
  useProfile: () => ({
    psychologist: { id: 'test-psychologist-id' },
  }),
}));

describe('PatientManagement', () => {
  const mockPatients = [
    {
      id: '1',
      first_name: 'Juan',
      last_name: 'Pérez',
      phone: '1234567890',
      age: 30,
      notes: 'Test notes',
      created_at: new Date().toISOString(),
      psychologist_id: 'test-psychologist-id',
    },
    {
      id: '2',
      first_name: 'María',
      last_name: 'González',
      phone: '0987654321',
      age: 25,
      notes: null,
      created_at: new Date().toISOString(),
      psychologist_id: 'test-psychologist-id',
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useOptimizedPatients).mockReturnValue({
      patients: mockPatients,
      loading: false,
      error: null,
      refetch: vi.fn(),
      addPatient: vi.fn().mockResolvedValue(true),
    });
  });

  const renderWithRouter = (component: React.ReactElement) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  it('should render patient list', () => {
    renderWithRouter(<PatientManagement />);

    expect(screen.getByText('Gestión de Pacientes')).toBeInTheDocument();
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.getByText('María González')).toBeInTheDocument();
  });

  it('should show add patient button', () => {
    renderWithRouter(<PatientManagement />);

    const addButton = screen.getByText('Agregar Paciente');
    expect(addButton).toBeInTheDocument();
  });

  it('should open add patient form when button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<PatientManagement />);

    const addButton = screen.getByText('Agregar Paciente');
    await user.click(addButton);

    expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument();
  });

  it('should display loading state', () => {
    vi.mocked(useOptimizedPatients).mockReturnValue({
      patients: [],
      loading: true,
      error: null,
      refetch: vi.fn(),
      addPatient: vi.fn(),
    });

    renderWithRouter(<PatientManagement />);

    // Should show loading indicator
    expect(screen.queryByText('Juan Pérez')).not.toBeInTheDocument();
  });

  it('should display error message', () => {
    vi.mocked(useOptimizedPatients).mockReturnValue({
      patients: [],
      loading: false,
      error: 'Error loading patients',
      refetch: vi.fn(),
      addPatient: vi.fn(),
    });

    renderWithRouter(<PatientManagement />);

    expect(screen.getByText(/Error al cargar pacientes/i)).toBeInTheDocument();
  });

  it('should display empty state when no patients', () => {
    vi.mocked(useOptimizedPatients).mockReturnValue({
      patients: [],
      loading: false,
      error: null,
      refetch: vi.fn(),
      addPatient: vi.fn(),
    });

    renderWithRouter(<PatientManagement />);

    expect(screen.getByText(/no hay pacientes/i)).toBeInTheDocument();
  });

  it('should filter patients by search term', async () => {
    const user = userEvent.setup();
    renderWithRouter(<PatientManagement />);

    const searchInput = screen.getByPlaceholderText(/buscar/i);
    await user.type(searchInput, 'Juan');

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument();
    expect(screen.queryByText('María González')).not.toBeInTheDocument();
  });
});

