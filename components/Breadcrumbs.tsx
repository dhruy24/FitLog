'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Auto-generate breadcrumbs from pathname if not provided
  const breadcrumbs = items || generateBreadcrumbs(pathname);

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/exercises');
  };

  return (
    <nav className="flex items-center gap-2 text-sm mb-6">
      <button
        onClick={handleHome}
        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium"
        title="Home"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      </button>
      
      <button
        onClick={handleBack}
        className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors font-medium"
        title="Back"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
        {breadcrumbs.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            {index > 0 && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
            {item.href && index < breadcrumbs.length - 1 ? (
              <Link
                href={item.href}
                className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className={index === breadcrumbs.length - 1 ? 'text-zinc-900 dark:text-zinc-100 font-medium' : ''}>
                {item.label}
              </span>
            )}
          </div>
        ))}
      </div>
    </nav>
  );
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [{ label: 'Home', href: '/exercises' }];

  if (pathname === '/exercises') {
    return items;
  }

  if (pathname.startsWith('/exercises/')) {
    items.push({ label: 'Exercises', href: '/exercises' });

    const parts = pathname.split('/').filter(Boolean);
    
    if (parts.length >= 2 && parts[0] === 'exercises') {
      const exerciseId = parts[1];
      
      // Try to get exercise name from URL or use ID
      if (parts.length === 2) {
        items.push({ label: 'Dashboard' });
      } else if (parts.length >= 3) {
        const action = parts[2];
        let actionLabel = action;
        
        if (action === 'entry') {
          actionLabel = 'Log Workout';
        } else if (action === 'history') {
          actionLabel = 'History';
        } else if (action === 'edit') {
          actionLabel = 'Edit Workout';
        } else if (action === 'add') {
          actionLabel = 'Add Exercise';
        }
        
        items.push({ label: 'Dashboard', href: `/exercises/${exerciseId}` });
        items.push({ label: actionLabel });
      }
    }
  } else if (pathname === '/profile') {
    items.push({ label: 'Profile Management' });
  } else if (pathname === '/exercises/add') {
    items.push({ label: 'Exercises', href: '/exercises' });
    items.push({ label: 'Add Exercise' });
  }

  return items;
}


