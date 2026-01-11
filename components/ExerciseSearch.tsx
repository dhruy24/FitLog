'use client';

interface ExerciseSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function ExerciseSearch({ searchTerm, onSearchChange }: ExerciseSearchProps) {
  return (
    <div className="w-full">
      <input
        type="text"
        placeholder="Search exercises..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-full px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
      />
    </div>
  );
}



