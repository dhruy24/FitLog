import { render, screen, fireEvent } from '@testing-library/react';
import { useRouter, usePathname } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(),
}));

const mockPush = jest.fn();
const mockBack = jest.fn();

describe('Breadcrumbs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  it('should render home and back buttons', () => {
    (usePathname as jest.Mock).mockReturnValue('/exercises');
    render(<Breadcrumbs />);

    const homeButton = screen.getByTitle('Home');
    const backButton = screen.getByTitle('Back');

    expect(homeButton).toBeInTheDocument();
    expect(backButton).toBeInTheDocument();
  });

  it('should navigate to exercises when home button is clicked', () => {
    (usePathname as jest.Mock).mockReturnValue('/exercises');
    render(<Breadcrumbs />);

    const homeButton = screen.getByTitle('Home');
    fireEvent.click(homeButton);

    expect(mockPush).toHaveBeenCalledWith('/exercises');
  });

  it('should go back when back button is clicked', () => {
    (usePathname as jest.Mock).mockReturnValue('/exercises');
    render(<Breadcrumbs />);

    const backButton = screen.getByTitle('Back');
    fireEvent.click(backButton);

    expect(mockBack).toHaveBeenCalled();
  });

  it('should generate breadcrumbs from pathname for exercises route', () => {
    (usePathname as jest.Mock).mockReturnValue('/exercises/bench-press');
    render(<Breadcrumbs />);

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Exercises')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should use custom breadcrumb items when provided', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    const customItems = [
      { label: 'Custom 1', href: '/custom1' },
      { label: 'Custom 2' },
    ];

    render(<Breadcrumbs items={customItems} />);

    expect(screen.getByText('Custom 1')).toBeInTheDocument();
    expect(screen.getByText('Custom 2')).toBeInTheDocument();
  });

  it('should render breadcrumbs for entry page', () => {
    (usePathname as jest.Mock).mockReturnValue('/exercises/bench-press/entry');
    render(<Breadcrumbs />);

    expect(screen.getByText('Log Workout')).toBeInTheDocument();
  });

  it('should render breadcrumbs for history page', () => {
    (usePathname as jest.Mock).mockReturnValue('/exercises/bench-press/history');
    render(<Breadcrumbs />);

    expect(screen.getByText('History')).toBeInTheDocument();
  });
});
