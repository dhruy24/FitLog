'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { migrateLocalStorageData } from '@/lib/storage-supabase';

export default function DataMigrationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrationResult, setMigrationResult] = useState<{ workouts: number; exercises: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkForLocalData = async () => {
      if (typeof window === 'undefined') return;

      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;

      // Check if user has already migrated
      const migrationKey = `fitlog-migrated-${user.id}`;
      const hasMigrated = localStorage.getItem(migrationKey);
      
      if (hasMigrated) return;

      // Check if there's local data to migrate
      const CURRENT_PROFILE_KEY = 'fitlog-current-profile';
      const STORAGE_KEY_PREFIX = 'fitlog-workouts-';
      const CUSTOM_EXERCISES_KEY_PREFIX = 'fitlog-custom-exercises-';
      
      const currentProfileId = localStorage.getItem(CURRENT_PROFILE_KEY);
      if (!currentProfileId) return;

      const workoutsKey = `${STORAGE_KEY_PREFIX}${currentProfileId}`;
      const exercisesKey = `${CUSTOM_EXERCISES_KEY_PREFIX}${currentProfileId}`;
      
      const hasWorkouts = localStorage.getItem(workoutsKey);
      const hasExercises = localStorage.getItem(exercisesKey);

      if (hasWorkouts || hasExercises) {
        setShowPrompt(true);
      }
    };

    checkForLocalData();
  }, []);

  const handleMigrate = async () => {
    setMigrating(true);
    setError(null);

    try {
      const result = await migrateLocalStorageData();
      setMigrationResult(result);
      
      // Mark as migrated
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        localStorage.setItem(`fitlog-migrated-${user.id}`, 'true');
      }

      setTimeout(() => {
        setShowPrompt(false);
        window.location.reload();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to migrate data');
      setMigrating(false);
    }
  };

  const handleSkip = () => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        localStorage.setItem(`fitlog-migrated-${user.id}`, 'skipped');
      }
    });
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-zinc-900 rounded-lg p-6 w-full max-w-md mx-4 border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Migrate Your Data
        </h2>
        
        {migrationResult ? (
          <div className="space-y-4">
            <p className="text-zinc-600 dark:text-zinc-400">
              Migration completed successfully!
            </p>
            <ul className="list-disc list-inside text-sm text-zinc-600 dark:text-zinc-400 space-y-1">
              <li>{migrationResult.workouts} workouts migrated</li>
              <li>{migrationResult.exercises} custom exercises migrated</li>
            </ul>
            <p className="text-sm text-zinc-500 dark:text-zinc-500">
              Refreshing page...
            </p>
          </div>
        ) : (
          <>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              We found workout data stored locally on this device. Would you like to migrate it to your cloud account so you can access it from any device?
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleMigrate}
                disabled={migrating}
                className="flex-1 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {migrating ? 'Migrating...' : 'Migrate Data'}
              </button>
              <button
                onClick={handleSkip}
                disabled={migrating}
                className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Skip
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


