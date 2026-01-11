import type { Metadata } from 'next';
import { getExerciseById } from '@/lib/exercises-server';
import ExerciseDashboard from '@/components/ExerciseDashboard';
import { generateExerciseMetadata } from '@/lib/seo';
import StructuredData, { generateExerciseSchema } from '@/components/StructuredData';

interface ExerciseDashboardPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: ExerciseDashboardPageProps): Promise<Metadata> {
  const { id } = await params;
  const exercise = await getExerciseById(id);

  if (!exercise) {
    return {
      title: 'Exercise Not Found',
      description: 'The requested exercise could not be found.',
    };
  }

  return generateExerciseMetadata(
    exercise.name,
    id,
    exercise.category,
    exercise.muscleGroup
  );
}

export default async function ExerciseDashboardPage({ params }: ExerciseDashboardPageProps) {
  const { id } = await params;
  const exercise = await getExerciseById(id);

  // If exercise not found on server (might be a custom exercise), 
  // still render the component - it will load the exercise name on the client
  const structuredData = exercise
    ? generateExerciseSchema(exercise.name, id, exercise.category, exercise.muscleGroup)
    : null;

  return (
    <>
      {structuredData && <StructuredData data={structuredData} />}
      <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <ExerciseDashboard exerciseId={id} exerciseName={exercise?.name || ''} />
        </div>
      </div>
    </>
  );
}

