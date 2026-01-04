'use client';

import { useState, useEffect } from 'react';
import { Profile } from '@/types';
import { getProfiles, createProfile, deleteProfile, updateProfile, getCurrentProfileId, setCurrentProfile } from '@/lib/storage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Breadcrumbs from './Breadcrumbs';

export default function ProfileManager() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [newProfileName, setNewProfileName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const loadProfiles = () => {
    const allProfiles = getProfiles();
    
    // If no profiles exist, create a default one
    if (allProfiles.length === 0) {
      try {
        const defaultProfile = createProfile('Default Profile');
        setProfiles([defaultProfile]);
      } catch (error: any) {
        setMessage({ type: 'error', text: error.message });
      }
    } else {
      setProfiles(allProfiles);
    }
  };

  const handleCreateProfile = () => {
    if (!newProfileName.trim()) {
      setMessage({ type: 'error', text: 'Please enter a profile name' });
      return;
    }

    try {
      const newProfile = createProfile(newProfileName);
      setProfiles([...profiles, newProfile]);
      setNewProfileName('');
      setMessage({ type: 'success', text: 'Profile created successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleStartEdit = (profile: Profile) => {
    setEditingId(profile.id);
    setEditName(profile.name);
  };

  const handleSaveEdit = (profileId: string) => {
    if (!editName.trim()) {
      setMessage({ type: 'error', text: 'Profile name cannot be empty' });
      return;
    }

    try {
      updateProfile(profileId, editName);
      setProfiles(profiles.map(p => p.id === profileId ? { ...p, name: editName.trim() } : p));
      setEditingId(null);
      setEditName('');
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleDeleteProfile = (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? All workout data for this profile will be permanently deleted.')) {
      return;
    }

    try {
      deleteProfile(profileId);
      const updated = profiles.filter(p => p.id !== profileId);
      setProfiles(updated);
      
      // If deleted profile was current, switch to first available
      const currentId = getCurrentProfileId();
      if (currentId === profileId && updated.length > 0) {
        setCurrentProfile(updated[0].id);
        router.refresh();
        window.location.reload();
      }
      
      setMessage({ type: 'success', text: 'Profile deleted successfully!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
    }
  };

  const handleSwitchProfile = (profileId: string) => {
    setCurrentProfile(profileId);
    router.refresh();
    window.location.reload();
  };

  const currentProfileId = getCurrentProfileId();

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <Breadcrumbs />
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          Profile Management
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Create and manage your workout profiles
        </p>
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

      {/* Create New Profile */}
      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
          Create New Profile
        </h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newProfileName}
            onChange={(e) => setNewProfileName(e.target.value)}
            placeholder="Enter profile name"
            className="flex-1 px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
            onKeyPress={(e) => e.key === 'Enter' && handleCreateProfile()}
          />
          <button
            onClick={handleCreateProfile}
            className="px-6 py-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors font-medium"
          >
            Create
          </button>
        </div>
      </div>

      {/* Profiles List */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          Your Profiles
        </h2>
        {profiles.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
            No profiles yet. Create your first profile above.
          </div>
        ) : (
          profiles.map((profile) => (
            <div
              key={profile.id}
              className="p-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-between"
            >
              {editingId === profile.id ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 px-3 py-1 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
                    onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit(profile.id)}
                  />
                  <button
                    onClick={() => handleSaveEdit(profile.id)}
                    className="px-4 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded-lg hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditName('');
                    }}
                    className="px-4 py-1 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm text-zinc-900 dark:text-zinc-100"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {profile.name}
                      </span>
                      {profile.id === currentProfileId && (
                        <span className="px-2 py-1 text-xs bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                      Created {new Date(profile.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {profile.id !== currentProfileId && (
                      <button
                        onClick={() => handleSwitchProfile(profile.id)}
                        className="px-4 py-2 text-sm bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      >
                        Switch
                      </button>
                    )}
                    <button
                      onClick={() => handleStartEdit(profile)}
                      className="px-4 py-2 text-sm border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-900 dark:text-zinc-100"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProfile(profile.id)}
                      disabled={profiles.length === 1}
                      className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      <div className="pt-4">
        <Link
          href="/exercises"
          className="px-6 py-3 border border-zinc-300 dark:border-zinc-700 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-medium text-zinc-900 dark:text-zinc-100 inline-block"
        >
          Back to Exercises
        </Link>
      </div>
    </div>
  );
}

