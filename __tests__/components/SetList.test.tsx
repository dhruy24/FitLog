import { render, screen, fireEvent } from '@testing-library/react';
import SetList from '@/components/SetList';
import { WorkoutSet } from '@/types';

describe('SetList', () => {
  it('should render empty state when no sets', () => {
    render(<SetList sets={[]} />);

    expect(screen.getByText('No sets added yet. Add your first set above.')).toBeInTheDocument();
  });

  it('should render sets correctly', () => {
    const sets: WorkoutSet[] = [
      { reps: 10, weight: 100 },
      { reps: 8, weight: 110 },
      { reps: 6, weight: 120 },
    ];

    render(<SetList sets={sets} />);

    // Use getAllByText since values appear in both mobile and desktop views
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    expect(screen.getAllByText('100').length).toBeGreaterThan(0);
    expect(screen.getAllByText('8').length).toBeGreaterThan(0);
    expect(screen.getAllByText('110').length).toBeGreaterThan(0);
    expect(screen.getAllByText('6').length).toBeGreaterThan(0);
    expect(screen.getAllByText('120').length).toBeGreaterThan(0);
  });

  it('should display set numbers', () => {
    const sets: WorkoutSet[] = [
      { reps: 10, weight: 100 },
      { reps: 8, weight: 110 },
    ];

    render(<SetList sets={sets} />);

    expect(screen.getByText('Set 1')).toBeInTheDocument();
    expect(screen.getByText('Set 2')).toBeInTheDocument();
  });

  it('should call onRemoveSet when remove button is clicked', () => {
    const sets: WorkoutSet[] = [
      { reps: 10, weight: 100 },
      { reps: 8, weight: 110 },
    ];
    const onRemoveSet = jest.fn();

    render(<SetList sets={sets} onRemoveSet={onRemoveSet} />);

    const removeButtons = screen.getAllByText('Remove');
    fireEvent.click(removeButtons[0]);

    expect(onRemoveSet).toHaveBeenCalledWith(0);
  });

  it('should not show remove buttons when onRemoveSet is not provided', () => {
    const sets: WorkoutSet[] = [
      { reps: 10, weight: 100 },
    ];

    render(<SetList sets={sets} />);

    expect(screen.queryByText('Remove')).not.toBeInTheDocument();
  });

  it('should handle single set', () => {
    const sets: WorkoutSet[] = [{ reps: 5, weight: 50 }];

    render(<SetList sets={sets} />);

    // Use getAllByText since values appear in both mobile and desktop views
    expect(screen.getAllByText('5').length).toBeGreaterThan(0);
    expect(screen.getAllByText('50').length).toBeGreaterThan(0);
    expect(screen.getByText('Set 1')).toBeInTheDocument();
  });
});
