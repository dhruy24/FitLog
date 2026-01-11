'use client';

import { useState, useMemo, useEffect } from 'react';
import { Exercise } from '@/types';
import { getCustomExercises } from '@/lib/storage/index';
import ExerciseCard from './ExerciseCard';
import ExerciseSearch from './ExerciseSearch';
import CategoryFilter from './CategoryFilter';

interface ExerciseListProps {
  exercises: Exercise[];
  categories: string[];
}

export default function ExerciseList({ exercises: predefinedExercises, categories: initialCategories }: ExerciseListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [customExercises, setCustomExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    // Load custom exercises on client side
    const loadCustomExercises = async () => {
      const custom = await getCustomExercises();
      setCustomExercises(custom);
    };
    loadCustomExercises();
  }, []);

  // Merge predefined and custom exercises, removing duplicates
  const allExercises = useMemo(() => {
    // Create a Map to deduplicate by ID (custom exercises take precedence)
    const exerciseMap = new Map<string, Exercise>();
    
    // First add database exercises
    predefinedExercises.forEach(ex => {
      exerciseMap.set(ex.id, ex);
    });
    
    // Then add custom exercises (they will overwrite database exercises with same ID)
    customExercises.forEach(ex => {
      exerciseMap.set(ex.id, ex);
    });
    
    // Convert map back to array
    return Array.from(exerciseMap.values());
  }, [predefinedExercises, customExercises]);

  // Get unique categories from all exercises
  const categories = useMemo(() => {
    return Array.from(new Set(allExercises.map(ex => ex.category)));
  }, [allExercises]);

  const filteredExercises = useMemo(() => {
    return allExercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = !selectedCategory || exercise.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [allExercises, searchTerm, selectedCategory]);

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <ExerciseSearch searchTerm={searchTerm} onSearchChange={setSearchTerm} />
        </div>
        <div className="w-full sm:w-64">
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>
      </div>

      {filteredExercises.length === 0 ? (
        <div className="text-center py-12 text-zinc-600 dark:text-zinc-400">
          No exercises found. Try adjusting your search or filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredExercises.map((exercise) => (
            <ExerciseCard key={exercise.id} exercise={exercise} />
          ))}
        </div>
      )}
    </div>
  );
}

