import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SetForm from '@/components/SetForm';

describe('SetForm', () => {
  const mockOnAddSet = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render form inputs', () => {
    render(<SetForm onAddSet={mockOnAddSet} />);

    expect(screen.getByPlaceholderText('Reps')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Weight (kg)')).toBeInTheDocument();
    expect(screen.getByText('Add Set')).toBeInTheDocument();
  });

  it('should call onAddSet with correct values when form is submitted', async () => {
    const user = userEvent.setup();
    render(<SetForm onAddSet={mockOnAddSet} />);

    const repsInput = screen.getByPlaceholderText('Reps');
    const weightInput = screen.getByPlaceholderText('Weight (kg)');
    const submitButton = screen.getByText('Add Set');

    await user.type(repsInput, '10');
    await user.type(weightInput, '100');
    await user.click(submitButton);

    expect(mockOnAddSet).toHaveBeenCalledWith({ reps: 10, weight: 100 });
  });

  it('should clear inputs after submission', async () => {
    const user = userEvent.setup();
    render(<SetForm onAddSet={mockOnAddSet} />);

    const repsInput = screen.getByPlaceholderText('Reps') as HTMLInputElement;
    const weightInput = screen.getByPlaceholderText('Weight (kg)') as HTMLInputElement;

    await user.type(repsInput, '10');
    await user.type(weightInput, '100');
    await user.click(screen.getByText('Add Set'));

    await waitFor(() => {
      expect(repsInput.value).toBe('');
      expect(weightInput.value).toBe('');
    });
  });

  it('should handle decimal weights', async () => {
    const user = userEvent.setup();
    render(<SetForm onAddSet={mockOnAddSet} />);

    const repsInput = screen.getByPlaceholderText('Reps');
    const weightInput = screen.getByPlaceholderText('Weight (kg)');

    await user.type(repsInput, '8');
    await user.type(weightInput, '100.5');
    await user.click(screen.getByText('Add Set'));

    expect(mockOnAddSet).toHaveBeenCalledWith({ reps: 8, weight: 100.5 });
  });

  it('should not submit with zero reps', async () => {
    const user = userEvent.setup();
    render(<SetForm onAddSet={mockOnAddSet} />);

    const repsInput = screen.getByPlaceholderText('Reps');
    const weightInput = screen.getByPlaceholderText('Weight (kg)');

    await user.type(repsInput, '0');
    await user.type(weightInput, '100');
    await user.click(screen.getByText('Add Set'));

    expect(mockOnAddSet).not.toHaveBeenCalled();
  });

  it('should allow zero weight', async () => {
    const user = userEvent.setup();
    render(<SetForm onAddSet={mockOnAddSet} />);

    const repsInput = screen.getByPlaceholderText('Reps');
    const weightInput = screen.getByPlaceholderText('Weight (kg)');

    await user.type(repsInput, '10');
    await user.type(weightInput, '0');
    await user.click(screen.getByText('Add Set'));

    expect(mockOnAddSet).toHaveBeenCalledWith({ reps: 10, weight: 0 });
  });
});
