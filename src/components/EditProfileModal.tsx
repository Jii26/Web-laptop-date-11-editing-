import React, { useState } from 'react';
import { X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GENRES, UserProfile } from '../types';

interface EditProfileModalProps {
  userProfile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditProfileModal({ 
  userProfile, 
  isOpen, 
  onClose, 
  onUpdate 
}: EditProfileModalProps) {
  const [formData, setFormData] = useState({
    username: userProfile.username,
    age: userProfile.age || '',
    interestedGenres: userProfile.interestedGenres
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', userProfile.id), {
        ...formData,
        updatedAt: new Date()
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Profile</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Username</label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Age</label>
            <input
              type="number"
              value={formData.age}
              onChange={(e) => setFormData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Favorite Genres (max 3)
            </label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      interestedGenres: prev.interestedGenres.includes(genre)
                        ? prev.interestedGenres.filter(g => g !== genre)
                        : prev.interestedGenres.length < 3
                        ? [...prev.interestedGenres, genre]
                        : prev.interestedGenres
                    }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.interestedGenres.includes(genre)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}