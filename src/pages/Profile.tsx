import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Link as LinkIcon, Pencil } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/database';
import ContentFeed from '../components/ContentFeed';

interface UserProfile {
  name: string;
  handle: string;
  bio: string;
  location: string;
  website: string;
  joinDate: string;
  following: number;
  followers: number;
  bweebs: number;
}

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    handle: '',
    bio: '',
    location: '',
    website: '',
    joinDate: '',
    following: 0,
    followers: 0,
    bweebs: 0
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    location: '',
    website: ''
  });

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          name: data.name || '',
          handle: `@${data.email.split('@')[0]}`,
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || '',
          joinDate: new Date(data.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
          following: 0,
          followers: 0,
          bweebs: 0
        });
        setEditForm({
          name: data.name || '',
          bio: data.bio || '',
          location: data.location || '',
          website: data.website || ''
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: editForm.name,
          bio: editForm.bio,
          location: editForm.location,
          website: editForm.website,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;

      setProfile(prev => ({
        ...prev,
        name: editForm.name,
        bio: editForm.bio,
        location: editForm.location,
        website: editForm.website
      }));
      setEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 dark:bg-gray-700"></div>
          <div className="px-3 -mt-16">
            <div className="w-28 h-28 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
            <div className="mt-4 space-y-3">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Cover Image */}
      <div className="h-32 bg-gradient-to-r from-blue-400 to-blue-600" />

      {/* Profile Info */}
      <div className="px-3">
        <div className="relative -mt-16">
          <div className="w-28 h-28 bg-white dark:bg-gray-800 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center">
            <span className="text-4xl">🤖</span>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="absolute top-0 right-0 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Pencil className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {editing ? (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <input
                type="text"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Website
              </label>
              <input
                type="text"
                value={editForm.website}
                onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-2">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-gray-500 dark:text-gray-400">{profile.handle}</p>
            </div>

            <p className="mt-2 text-gray-700 dark:text-gray-300 text-sm">{profile.bio}</p>

            <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
              {profile.location && (
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {profile.location}
                </div>
              )}
              {profile.website && (
                <div className="flex items-center">
                  <LinkIcon className="h-4 w-4 mr-1" />
                  <a
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {profile.website}
                  </a>
                </div>
              )}
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Joined {profile.joinDate}
              </div>
            </div>

            <div className="mt-2 flex gap-4 text-sm">
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {profile.following.toLocaleString()}
                </strong>{' '}
                <span className="text-gray-500 dark:text-gray-400">Following</span>
              </span>
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {profile.followers.toLocaleString()}
                </strong>{' '}
                <span className="text-gray-500 dark:text-gray-400">Followers</span>
              </span>
              <span>
                <strong className="text-gray-900 dark:text-white">
                  {profile.bweebs.toLocaleString()}
                </strong>{' '}
                <span className="text-gray-500 dark:text-gray-400">Bweebs</span>
              </span>
            </div>
          </>
        )}
      </div>

      {/* Content Feed */}
      <div className="mt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="py-2">
          <ContentFeed />
        </div>
      </div>
    </div>
  );
}