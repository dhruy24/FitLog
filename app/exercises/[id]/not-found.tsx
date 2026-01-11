import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto text-center py-12">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
          Exercise Not Found
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-8">
          The exercise you're looking for doesn't exist.
        </p>
        <Link
          href="/exercises"
          className="px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium inline-block"
        >
          Back to Exercises
        </Link>
      </div>
    </div>
  );
}



