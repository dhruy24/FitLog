'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types';
import { getProfiles, getCurrentProfileId, setCurrentProfile, createProfile } from '@/lib/storage';
import { useRouter } from 'next/navigation';

export default function ProfileSelector() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentProfileId, setCurrentProfileIdState] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = () => {
    const allProfiles = getProfiles();
    const currentId = getCurrentProfileId();
    
    // If no profiles exist, create a default one
    if (allProfiles.length === 0) {
      try {
        const defaultProfile = createProfile('Default Profile');
        setProfiles([defaultProfile]);
        setCurrentProfileIdState(defaultProfile.id);
      } catch (error) {
        console.error('Error creating default profile:', error);
      }
    } else {
      setProfiles(allProfiles);
      setCurrentProfileIdState(currentId || allProfiles[0].id);
    }
  };

  const handleProfileChange = (profileId: string) => {
    setCurrentProfile(profileId);
    setCurrentProfileIdState(profileId);
    setIsOpen(false);
    // Reload the page to refresh all data
    router.refresh();
    window.location.reload();
  };

  const currentProfile = profiles.find(p => p.id === currentProfileId);

  if (profiles.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors min-h-[44px] text-xs md:text-sm font-medium"
      >
        <span className="font-medium max-w-[100px] md:max-w-none truncate">
          {currentProfile?.name || 'Select Profile'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full mt-2 right-0 z-20 w-64 md:w-64 max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg">
            <div className="p-2 max-h-[70vh] overflow-y-auto">
              {profiles.map((profile) => (
                <button
                  key={profile.id}
                  onClick={() => handleProfileChange(profile.id)}
                  className={`w-full text-left px-3 py-3 rounded-lg text-sm transition-colors min-h-[44px] flex items-center ${
                    profile.id === currentProfileId
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100'
                  }`}
                >
                  {profile.name}
                </button>
              ))}
              <div className="border-t border-zinc-200 dark:border-zinc-800 mt-2 pt-2">
                <button
                  onClick={() => {
                    setIsOpen(false);
                    router.push('/profile');
                  }}
                  className="w-full text-left px-3 py-3 rounded-lg text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-900 dark:text-zinc-100 min-h-[44px] flex items-center"
                >
                  Manage Profiles
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

