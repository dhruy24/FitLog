'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Exercise } from '@/types';
import { saveCustomExercise } from '@/lib/storage/index';
import { generateExerciseId, getCategories, getMuscleGroups } from '@/lib/exercises';
import Breadcrumbs from './Breadcrumbs';

export default function AddExerciseForm() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [categories, setCategories] = useState<string[]>([]);
  const [muscleGroups, setMuscleGroups] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const cats = await getCategories();
      const groups = await getMuscleGroups();
      setCategories(cats);
      setMuscleGroups(groups);
    };
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim() || !category || !muscleGroup) {
      setMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    setIsSaving(true);
    setMessage(null);
    
    try {
      const exercise: Exercise = {
        id: generateExerciseId(name),
        name: name.trim(),
        category,
        muscleGroup,
      };

      await saveCustomExercise(exercise);
      setMessage({ type: 'success', text: 'Exercise added successfully!' });
      
      // Redirect to exercises page after a short delay
      setTimeout(() => {
        router.push('/exercises');
      }, 1500);
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.message || 'Failed to add exercise. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Breadcrumbs />
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Add Custom Exercise
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Create a new exercise to track in your workouts
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Exercise Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Custom Bench Press"
            required
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Muscle Group *
          </label>
          <select
            value={muscleGroup}
            onChange={(e) => setMuscleGroup(e.target.value)}
            required
            className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
          >
            <option value="">Select a muscle group</option>
            {muscleGroups.map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSaving}
            className="flex-1 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? 'Adding...' : 'Add Exercise'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/exercises')}
            className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-900 dark:text-zinc-100"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}


