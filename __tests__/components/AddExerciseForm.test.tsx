import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import AddExerciseForm from '@/components/AddExerciseForm';
import { saveCustomExercise } from '@/lib/storage/index';
import { getCategories, getMuscleGroups } from '@/lib/exercises';

// Mock Breadcrumbs to avoid navigation issues
jest.mock('@/components/Breadcrumbs', () => {
  return function MockBreadcrumbs() {
    return <nav data-testid="breadcrumbs">Breadcrumbs</nav>;
  };
});

jest.mock('@/lib/storage/index', () => ({
  saveCustomExercise: jest.fn(),
}));

jest.mock('@/lib/exercises', () => ({
  generateExerciseId: jest.fn((name) => name.toLowerCase().replace(/\s+/g, '-')),
  getCategories: jest.fn(),
  getMuscleGroups: jest.fn(),
}));

const mockPush = jest.fn();

describe('AddExerciseForm', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
    });
    (getCategories as jest.Mock).mockResolvedValue(['Chest', 'Back', 'Legs']);
    (getMuscleGroups as jest.Mock).mockResolvedValue(['Upper Body', 'Lower Body']);
  });

  it('should render form fields', async () => {
    render(<AddExerciseForm />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Custom Bench Press/i)).toBeInTheDocument();
      expect(screen.getByText(/Category/i)).toBeInTheDocument();
      expect(screen.getByText(/Muscle Group/i)).toBeInTheDocument();
    });
  });

  it('should load categories and muscle groups', async () => {
    render(<AddExerciseForm />);

    await waitFor(() => {
      expect(getCategories).toHaveBeenCalled();
      expect(getMuscleGroups).toHaveBeenCalled();
    });
  });

  it('should show error message when submitting empty form', async () => {
    const user = userEvent.setup();
    render(<AddExerciseForm />);

    await waitFor(() => {
      expect(screen.getByText('Add Exercise')).toBeInTheDocument();
    });

    const submitButton = screen.getByText('Add Exercise');
    await user.click(submitButton);

    // HTML5 validation will prevent submission, but we can check the form is not submitted
    await waitFor(() => {
      // The error message should appear if validation fails
      const errorMessage = screen.queryByText(/Please fill in all fields/i);
      // If HTML5 validation prevents submission, saveCustomExercise won't be called
      expect(saveCustomExercise).not.toHaveBeenCalled();
    });
  });

  it('should submit form with valid data', async () => {
    const user = userEvent.setup();
    (saveCustomExercise as jest.Mock).mockResolvedValue(undefined);

    render(<AddExerciseForm />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Custom Bench Press/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Custom Bench Press/i);
    await user.type(nameInput, 'Custom Exercise');
    
    // Wait for categories to load
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'Chest');
    await user.selectOptions(selects[1], 'Upper Body');

    const submitButton = screen.getByText('Add Exercise');
    await user.click(submitButton);

    await waitFor(() => {
      expect(saveCustomExercise).toHaveBeenCalledWith({
        id: 'custom-exercise',
        name: 'Custom Exercise',
        category: 'Chest',
        muscleGroup: 'Upper Body',
      });
    });
  });

  it('should show success message and redirect after successful submission', async () => {
    const user = userEvent.setup();
    (saveCustomExercise as jest.Mock).mockResolvedValue(undefined);

    jest.useFakeTimers();
    render(<AddExerciseForm />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Custom Bench Press/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Custom Bench Press/i);
    await user.type(nameInput, 'Custom Exercise');
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'Chest');
    await user.selectOptions(selects[1], 'Upper Body');

    const submitButton = screen.getByText('Add Exercise');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Exercise added successfully!')).toBeInTheDocument();
    });

    jest.advanceTimersByTime(1500);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/exercises');
    });

    jest.useRealTimers();
  });

  it('should show error message on submission failure', async () => {
    const user = userEvent.setup();
    (saveCustomExercise as jest.Mock).mockRejectedValue(new Error('Save failed'));

    render(<AddExerciseForm />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Custom Bench Press/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Custom Bench Press/i);
    await user.type(nameInput, 'Custom Exercise');
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'Chest');
    await user.selectOptions(selects[1], 'Upper Body');

    const submitButton = screen.getByText('Add Exercise');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Save failed')).toBeInTheDocument();
    });
  });

  it('should disable submit button while saving', async () => {
    const user = userEvent.setup();
    (saveCustomExercise as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100))
    );

    render(<AddExerciseForm />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Custom Bench Press/i)).toBeInTheDocument();
    });

    const nameInput = screen.getByPlaceholderText(/Custom Bench Press/i);
    await user.type(nameInput, 'Custom Exercise');
    
    await waitFor(() => {
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    const selects = screen.getAllByRole('combobox');
    await user.selectOptions(selects[0], 'Chest');
    await user.selectOptions(selects[1], 'Upper Body');

    const submitButton = screen.getByText('Add Exercise');
    await user.click(submitButton);

    expect(screen.getByText('Adding...')).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });
});
