import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ExerciseList from '@/components/ExerciseList';
import { Exercise } from '@/types';
import { getCustomExercises } from '@/lib/storage/index';

// Mock dependencies
jest.mock('@/lib/storage/index', () => ({
  getCustomExercises: jest.fn(),
}));

jest.mock('@/components/ExerciseCard', () => {
  return function MockExerciseCard({ exercise }: { exercise: Exercise }) {
    return <div data-testid={`exercise-${exercise.id}`}>{exercise.name}</div>;
  };
});

jest.mock('@/components/ExerciseSearch', () => {
  return function MockExerciseSearch({
    searchTerm,
    onSearchChange,
  }: {
    searchTerm: string;
    onSearchChange: (term: string) => void;
  }) {
    return (
      <input
        data-testid="exercise-search"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search exercises"
      />
    );
  };
});

jest.mock('@/components/CategoryFilter', () => {
  return function MockCategoryFilter({
    categories,
    selectedCategory,
    onCategoryChange,
  }: {
    categories: string[];
    selectedCategory: string | null;
    onCategoryChange: (category: string | null) => void;
  }) {
    return (
      <select
        data-testid="category-filter"
        value={selectedCategory || ''}
        onChange={(e) => onCategoryChange(e.target.value || null)}
      >
        <option value="">All</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    );
  };
});

describe('ExerciseList', () => {
  const mockExercises: Exercise[] = [
    { id: 'bench-press', name: 'Bench Press', category: 'Chest', muscleGroup: 'Upper Body' },
    { id: 'squat', name: 'Squat', category: 'Legs', muscleGroup: 'Lower Body' },
    { id: 'deadlift', name: 'Deadlift', category: 'Back', muscleGroup: 'Lower Body' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getCustomExercises as jest.Mock).mockResolvedValue([]);
  });

  it('should render all exercises', async () => {
    render(<ExerciseList exercises={mockExercises} categories={['Chest', 'Legs', 'Back']} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-bench-press')).toBeInTheDocument();
      expect(screen.getByTestId('exercise-squat')).toBeInTheDocument();
      expect(screen.getByTestId('exercise-deadlift')).toBeInTheDocument();
    });
  });

  it('should filter exercises by search term', async () => {
    const user = userEvent.setup();
    render(<ExerciseList exercises={mockExercises} categories={['Chest', 'Legs', 'Back']} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-search')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('exercise-search');
    await user.type(searchInput, 'bench');

    await waitFor(() => {
      expect(screen.getByTestId('exercise-bench-press')).toBeInTheDocument();
      expect(screen.queryByTestId('exercise-squat')).not.toBeInTheDocument();
      expect(screen.queryByTestId('exercise-deadlift')).not.toBeInTheDocument();
    });
  });

  it('should filter exercises by category', async () => {
    const user = userEvent.setup();
    render(<ExerciseList exercises={mockExercises} categories={['Chest', 'Legs', 'Back']} />);

    await waitFor(() => {
      expect(screen.getByTestId('category-filter')).toBeInTheDocument();
    });

    const categoryFilter = screen.getByTestId('category-filter');
    await user.selectOptions(categoryFilter, 'Chest');

    await waitFor(() => {
      expect(screen.getByTestId('exercise-bench-press')).toBeInTheDocument();
      expect(screen.queryByTestId('exercise-squat')).not.toBeInTheDocument();
      expect(screen.queryByTestId('exercise-deadlift')).not.toBeInTheDocument();
    });
  });

  it('should combine search and category filters', async () => {
    const user = userEvent.setup();
    render(<ExerciseList exercises={mockExercises} categories={['Chest', 'Legs', 'Back']} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-search')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('exercise-search');
    await user.type(searchInput, 's');

    const categoryFilter = screen.getByTestId('category-filter');
    await user.selectOptions(categoryFilter, 'Legs');

    await waitFor(() => {
      expect(screen.getByTestId('exercise-squat')).toBeInTheDocument();
      expect(screen.queryByTestId('exercise-bench-press')).not.toBeInTheDocument();
      expect(screen.queryByTestId('exercise-deadlift')).not.toBeInTheDocument();
    });
  });

  it('should show empty state when no exercises match filters', async () => {
    const user = userEvent.setup();
    render(<ExerciseList exercises={mockExercises} categories={['Chest', 'Legs', 'Back']} />);

    await waitFor(() => {
      expect(screen.getByTestId('exercise-search')).toBeInTheDocument();
    });

    const searchInput = screen.getByTestId('exercise-search');
    await user.type(searchInput, 'nonexistent');

    await waitFor(() => {
      expect(screen.getByText('No exercises found. Try adjusting your search or filter.')).toBeInTheDocument();
    });
  });

  it('should deduplicate exercises by ID (custom exercises take precedence)', async () => {
    const customExercises: Exercise[] = [
      { id: 'bench-press', name: 'Custom Bench Press', category: 'Chest', muscleGroup: 'Upper Body' },
    ];
    (getCustomExercises as jest.Mock).mockResolvedValue(customExercises);

    render(<ExerciseList exercises={mockExercises} categories={['Chest', 'Legs', 'Back']} />);

    await waitFor(() => {
      const benchPressElement = screen.getByTestId('exercise-bench-press');
      expect(benchPressElement).toHaveTextContent('Custom Bench Press');
      // Should not have duplicate
      expect(screen.getAllByTestId('exercise-bench-press')).toHaveLength(1);
    });
  });

  it('should load custom exercises on mount', async () => {
    render(<ExerciseList exercises={mockExercises} categories={['Chest', 'Legs', 'Back']} />);

    await waitFor(() => {
      expect(getCustomExercises).toHaveBeenCalled();
    });
  });
});
