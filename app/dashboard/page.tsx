import MainDashboard from '@/components/MainDashboard';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black py-4 sm:py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <MainDashboard />
      </div>
    </div>
  );
}

