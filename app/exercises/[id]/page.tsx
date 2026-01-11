import { getExerciseById } from '@/lib/exercises-server';
import ExerciseDashboard from '@/components/ExerciseDashboard';

interface ExerciseDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function ExerciseDashboardPage({ params }: ExerciseDashboardPageProps) {
  const { id } = await params;
  const exercise = await getExerciseById(id);

  // If exercise not found on server (might be a custom exercise), 
  // still render the component - it will load the exercise name on the client
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <ExerciseDashboard exerciseId={id} exerciseName={exercise?.name || ''} />
      </div>
    </div>
  );
}

