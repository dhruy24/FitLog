'use client';

import { useState, useEffect, useMemo } from 'react';
import { Exercise, WorkoutLog, WorkoutMetrics } from '@/types';
import { getExerciseList, getExerciseById } from '@/lib/exercises';
import { getWorkouts, calculateWorkoutMetrics } from '@/lib/storage/index';
import { format, parseISO, isToday, isYesterday, isThisWeek, isThisMonth, subDays, startOfDay } from 'date-fns';
import Link from 'next/link';
import Breadcrumbs from './Breadcrumbs';
import SetList from './SetList';

interface DayWorkouts {
  date: string;
  workouts: WorkoutLog[];
  exercises: Map<string, { exercise: Exercise; workouts: WorkoutLog[] }>;
  totalVolume: number;
}

export default function MainDashboard() {
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [daysData, setDaysData] = useState<DayWorkouts[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    const exercises = await getExerciseList();
    setAllExercises(exercises);

    // Get all workouts (no filter)
    const allWorkouts = await getWorkouts();
    
    // Group workouts by date
    const workoutsByDate = new Map<string, WorkoutLog[]>();
    
    allWorkouts.forEach(workout => {
      const date = workout.date;
      if (!workoutsByDate.has(date)) {
        workoutsByDate.set(date, []);
      }
      workoutsByDate.get(date)!.push(workout);
    });

    // Create day data with exercises
    const days: DayWorkouts[] = await Promise.all(Array.from(workoutsByDate.entries())
      .map(async ([date, workouts]) => {
        // Group workouts by exercise
        const exercisesMap = new Map<string, { exercise: Exercise; workouts: WorkoutLog[] }>();
        
        for (const workout of workouts) {
          const exercise = await getExerciseById(workout.exerciseId);
          if (exercise) {
            if (!exercisesMap.has(exercise.id)) {
              exercisesMap.set(exercise.id, { exercise, workouts: [] });
            }
            exercisesMap.get(exercise.id)!.workouts.push(workout);
          }
        }

        // Calculate total volume for the day
        let totalVolume = 0;
        workouts.forEach(workout => {
          const metrics = calculateWorkoutMetrics(workout);
          totalVolume += metrics.totalVolume;
        });

        return {
          date,
          workouts,
          exercises: exercisesMap,
          totalVolume,
        };
      }));
    
    // Sort by date (newest first)
    days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setDaysData(days);
    setIsLoading(false);
  };

  const toggleDay = (date: string) => {
    setExpandedDay(expandedDay === date ? null : date);
    setExpandedExercise(null);
  };

  const toggleExercise = (exerciseId: string) => {
    setExpandedExercise(expandedExercise === exerciseId ? null : exerciseId);
  };

  const formatDateLabel = (dateStr: string) => {
    const date = parseISO(dateStr);
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (isThisWeek(date)) return format(date, 'EEEE');
    if (isThisMonth(date)) return format(date, 'EEEE, MMMM d');
    return format(date, 'EEEE, MMMM d, yyyy');
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-7xl mx-auto text-center py-12 text-zinc-600 dark:text-zinc-400">
        Loading...
      </div>
    );
  }

  const totalWorkouts = daysData.reduce((sum, day) => sum + day.workouts.length, 0);
  const totalVolume = daysData.reduce((sum, day) => sum + day.totalVolume, 0);
  const uniqueExercises = new Set(daysData.flatMap(day => Array.from(day.exercises.keys()))).size;

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      <Breadcrumbs />
      
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Dashboard
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Your workout history organized by day
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Days</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {daysData.length}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Workouts</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalWorkouts}
          </div>
        </div>
        <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total Volume (kg)</div>
          <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            {totalVolume.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Overall Progress Graphs */}
      {daysData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Daily Volume Chart */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Daily Volume (Last 30 Days)
            </h3>
            <DailyVolumeChart daysData={daysData} />
          </div>

          {/* Workout Calendar Heatmap */}
          <div className="p-6 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Workout Activity Calendar
            </h3>
            <WorkoutCalendarHeatmap daysData={daysData} />
          </div>
        </div>
      )}

      {/* Days List */}
      {daysData.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg">
          <p className="text-zinc-600 dark:text-zinc-400 mb-4">
            No workout data yet. Start logging workouts to see your progress!
          </p>
          <Link
            href="/exercises"
            className="inline-block px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
          >
            Browse Exercises
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
            Workout Days
          </h2>
          {daysData.map((day) => (
            <DayCard
              key={day.date}
              day={day}
              isExpanded={expandedDay === day.date}
              expandedExercise={expandedExercise}
              onToggleDay={() => toggleDay(day.date)}
              onToggleExercise={toggleExercise}
              formatDateLabel={formatDateLabel}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface DayCardProps {
  day: DayWorkouts;
  isExpanded: boolean;
  expandedExercise: string | null;
  onToggleDay: () => void;
  onToggleExercise: (exerciseId: string) => void;
  formatDateLabel: (date: string) => string;
}

function DayCard({ day, isExpanded, expandedExercise, onToggleDay, onToggleExercise, formatDateLabel }: DayCardProps) {
  const exercises = Array.from(day.exercises.values());
  const exerciseCount = exercises.length;
  const workoutCount = day.workouts.length;

  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggleDay}
        className="w-full p-4 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {formatDateLabel(day.date)}
              </h3>
              <span className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
                {format(parseISO(day.date), 'MMM d, yyyy')}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-sm">
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">Exercises: </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{exerciseCount}</span>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">Workouts: </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">{workoutCount}</span>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">Volume: </span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">
                  {day.totalVolume.toLocaleString()} kg
                </span>
              </div>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-zinc-600 dark:text-zinc-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
          <h4 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-3">
            Exercises Performed
          </h4>
          <div className="space-y-3">
            {exercises.map(({ exercise, workouts }) => (
              <ExerciseDayItem
                key={exercise.id}
                exercise={exercise}
                workouts={workouts}
                isExpanded={expandedExercise === exercise.id}
                onToggle={() => onToggleExercise(exercise.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface ExerciseDayItemProps {
  exercise: Exercise;
  workouts: WorkoutLog[];
  isExpanded: boolean;
  onToggle: () => void;
}

function ExerciseDayItem({ exercise, workouts, isExpanded, onToggle }: ExerciseDayItemProps) {
  const totalSets = workouts.reduce((sum, w) => sum + w.sets.length, 0);
  const totalVolume = workouts.reduce((sum, w) => {
    const metrics = calculateWorkoutMetrics(w);
    return sum + metrics.totalVolume;
  }, 0);

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full p-3 text-left hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h5 className="font-semibold text-zinc-900 dark:text-zinc-100">
                {exercise.name}
              </h5>
              <span className="px-2 py-0.5 text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded">
                {exercise.category}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 sm:gap-4 text-sm text-zinc-600 dark:text-zinc-400">
              <span>{workouts.length} {workouts.length === 1 ? 'workout' : 'workouts'}</span>
              <span>{totalSets} {totalSets === 1 ? 'set' : 'sets'}</span>
              <span>{totalVolume.toLocaleString()} kg volume</span>
            </div>
          </div>
          <svg
            className={`w-4 h-4 text-zinc-600 dark:text-zinc-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-4">
          {workouts.map((workout) => {
            const metrics = calculateWorkoutMetrics(workout);
            return (
              <div
                key={workout.id}
                className="p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {format(parseISO(workout.date), 'h:mm a')}
                  </div>
                  <div className="text-xs text-zinc-600 dark:text-zinc-400">
                    {metrics.totalVolume.toLocaleString()} kg volume
                  </div>
                </div>
                <SetList sets={workout.sets} />
                <div className="mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <Link
                    href={`/exercises/${exercise.id}/edit/${workout.id}`}
                    className="text-xs text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
                  >
                    Edit workout →
                  </Link>
                </div>
              </div>
            );
          })}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <Link
              href={`/exercises/${exercise.id}`}
              className="text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 font-medium"
            >
              View Exercise Dashboard →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Daily Volume Chart Component
function DailyVolumeChart({ daysData }: { daysData: DayWorkouts[] }) {
  const last30Days = useMemo(() => {
    const days = [];
    const today = new Date();
    const daysMap = new Map(daysData.map(d => [d.date, d]));
    
    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(startOfDay(date), 'yyyy-MM-dd');
      const dayData = daysMap.get(dateStr);
      days.push({
        date: dateStr,
        volume: dayData ? dayData.totalVolume : 0,
      });
    }
    return days;
  }, [daysData]);

  const maxVolume = Math.max(...last30Days.map(d => d.volume), 1);

  return (
    <div className="h-32 sm:h-48 flex items-end gap-0.5 sm:gap-1 overflow-x-auto">
      {last30Days.map((day, i) => (
        <div
          key={i}
          className="flex-1 min-w-[8px] bg-zinc-900 dark:bg-zinc-100 rounded-t hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
          style={{ height: `${(day.volume / maxVolume) * 100}%` }}
          title={`${format(parseISO(day.date), 'MMM d')}: ${day.volume.toLocaleString()} kg`}
        />
      ))}
    </div>
  );
}

// Workout Calendar Heatmap Component (GitHub-style)
function WorkoutCalendarHeatmap({ daysData }: { daysData: DayWorkouts[] }) {
  const [view, setView] = useState<'week' | 'month' | 'year'>('month');
  
  const calendarData = useMemo(() => {
    const daysMap = new Map(daysData.map(d => [d.date, d.workouts.length]));
    const today = new Date();
    
    if (view === 'week') {
      // Show current week (7 days)
      const weekData: { date: string; count: number; dayOfWeek: number }[] = [];
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
      
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + day);
        const dateStr = format(startOfDay(currentDate), 'yyyy-MM-dd');
        const count = daysMap.get(dateStr) || 0;
        weekData.push({
          date: dateStr,
          count,
          dayOfWeek: day,
        });
      }
      
      return [weekData]; // Single week
    } else if (view === 'month') {
      // Show current month (4-5 weeks)
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const startDate = new Date(monthStart);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday of first week
      
      const weeks: { date: string; count: number; dayOfWeek: number }[][] = [];
      let currentDate = new Date(startDate);
      const endDate = new Date(monthEnd);
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday of last week
      
      while (currentDate <= endDate) {
        const weekData: { date: string; count: number; dayOfWeek: number }[] = [];
        for (let day = 0; day < 7; day++) {
          const dateStr = format(startOfDay(currentDate), 'yyyy-MM-dd');
          const count = daysMap.get(dateStr) || 0;
          weekData.push({
            date: dateStr,
            count,
            dayOfWeek: day,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(weekData);
      }
      
      return weeks;
    } else {
      // Show last 52 weeks (year view) - approximately 1 year
      const weeks: { date: string; count: number; dayOfWeek: number }[][] = [];
      let currentDate = new Date(today);
      currentDate.setDate(currentDate.getDate() - (52 * 7 - currentDate.getDay())); // Start from Sunday of 52 weeks ago
      
      for (let week = 0; week < 52; week++) {
        const weekData: { date: string; count: number; dayOfWeek: number }[] = [];
        for (let day = 0; day < 7; day++) {
          const dateStr = format(startOfDay(currentDate), 'yyyy-MM-dd');
          const count = daysMap.get(dateStr) || 0;
          weekData.push({
            date: dateStr,
            count,
            dayOfWeek: day,
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        weeks.push(weekData);
      }
      
      return weeks;
    }
  }, [daysData, view]);

  const maxCount = Math.max(...Array.from(new Map(daysData.map(d => [d.date, d.workouts.length])).values()), 1);

  const getColorClass = (count: number) => {
    if (count === 0) return 'bg-zinc-100 dark:bg-zinc-800';
    const intensity = Math.min(count / maxCount, 1);
    if (intensity <= 0.25) return 'bg-green-200 dark:bg-green-900';
    if (intensity <= 0.5) return 'bg-green-400 dark:bg-green-700';
    if (intensity <= 0.75) return 'bg-green-600 dark:bg-green-500';
    return 'bg-green-800 dark:bg-green-400';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Calculate square size based on view to fit without scrolling
  const getSquareSize = () => {
    if (view === 'week') return 'w-8 h-8 sm:w-10 sm:h-10';
    if (view === 'month') return 'w-3 h-3 sm:w-4 sm:h-4';
    return 'w-2 h-2 sm:w-2.5 sm:h-2.5';
  };

  const squareSize = getSquareSize();
  const gapSize = view === 'week' ? 'gap-1 sm:gap-2' : view === 'month' ? 'gap-0.5 sm:gap-1' : 'gap-0.5';

  return (
    <div className="w-full">
      {/* View Selector */}
      <div className="flex justify-end mb-4">
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1">
          <button
            onClick={() => setView('week')}
            className={`px-2 sm:px-3 py-1.5 sm:py-1 text-xs font-medium rounded transition-colors min-h-[44px] sm:min-h-0 ${
              view === 'week'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setView('month')}
            className={`px-2 sm:px-3 py-1.5 sm:py-1 text-xs font-medium rounded transition-colors min-h-[44px] sm:min-h-0 ${
              view === 'month'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setView('year')}
            className={`px-2 sm:px-3 py-1.5 sm:py-1 text-xs font-medium rounded transition-colors min-h-[44px] sm:min-h-0 ${
              view === 'year'
                ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                : 'text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'
            }`}
          >
            Year
          </button>
        </div>
      </div>

      <div className="flex gap-1 sm:gap-2 w-full overflow-x-auto">
        {/* Day labels */}
        <div className="flex flex-col gap-0.5 sm:gap-1 pr-1 sm:pr-2 flex-shrink-0">
          <div className="h-4"></div>
          {dayLabels.map((label, i) => (
            <div key={i} className={`${squareSize} text-[10px] sm:text-xs text-zinc-600 dark:text-zinc-400 flex items-center`}>
              {view === 'week' ? label : i % 2 === 1 ? label : ''}
            </div>
          ))}
        </div>
        
        {/* Calendar grid - constrained to fit without scrolling */}
        <div className={`flex ${gapSize} flex-1 min-w-0`} style={{ 
          maxWidth: '100%',
          justifyContent: 'flex-start'
        }}>
          {calendarData.map((week, weekIndex) => (
            <div key={weekIndex} className={`flex flex-col ${gapSize} flex-shrink-0`}>
              {week.map((day, dayIndex) => {
                const date = parseISO(day.date);
                const isFuture = date > new Date();
                const isCurrentMonth = view === 'month' && date.getMonth() === new Date().getMonth();
                const showDate = view === 'week' || (view === 'month' && dayIndex === 0);
                
                return (
                  <div key={`${weekIndex}-${dayIndex}`} className="relative">
                    <div
                      className={`${squareSize} rounded-sm ${isFuture ? 'bg-zinc-50 dark:bg-zinc-900' : getColorClass(day.count)} transition-colors cursor-pointer hover:ring-2 hover:ring-zinc-400 dark:hover:ring-zinc-500 ${
                        !isCurrentMonth && view === 'month' ? 'opacity-50' : ''
                      }`}
                      title={`${format(date, 'MMM d, yyyy')}: ${day.count} ${day.count === 1 ? 'workout' : 'workouts'}`}
                    />
                    {showDate && (
                      <div className="absolute -top-4 left-0 text-[10px] text-zinc-500 dark:text-zinc-500 whitespace-nowrap">
                        {format(date, 'MMM d')}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
      
      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-zinc-600 dark:text-zinc-400">
        <span>Less</span>
        <div className="flex gap-0.5">
          <div className="w-3 h-3 rounded-sm bg-zinc-100 dark:bg-zinc-800"></div>
          <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900"></div>
          <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700"></div>
          <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-500"></div>
          <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-400"></div>
        </div>
        <span>More</span>
      </div>
    </div>
  );
}
