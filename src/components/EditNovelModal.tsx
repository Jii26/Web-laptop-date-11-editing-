import React, { useState } from 'react';
import { X } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GENRES, Novel } from '../types';

interface EditNovelModalProps {
  novel: Novel;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

export default function EditNovelModal({ novel, isOpen, onClose, onUpdate }: EditNovelModalProps) {
  const [formData, setFormData] = useState({
    title: novel.title,
    author: novel.author,
    genre: novel.genre,
    leadingCharacter: novel.leadingCharacter,
    story: novel.story
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'novels', novel.id), {
        ...formData,
        updatedAt: new Date()
      });
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating novel:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-2xl w-full relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700">
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">Edit Novel</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Title</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Author</label>
            <input
              type="text"
              required
              value={formData.author}
              onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Genres (max 3)</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(genre => (
                <button
                  key={genre}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({
                      ...prev,
                      genre: prev.genre.includes(genre)
                        ? prev.genre.filter(g => g !== genre)
                        : prev.genre.length < 3
                        ? [...prev.genre, genre]
                        : prev.genre
                    }));
                  }}
                  className={`px-3 py-1 rounded-full text-sm ${
                    formData.genre.includes(genre)
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Leading Character</label>
            <select
              value={formData.leadingCharacter}
              onChange={(e) => setFormData(prev => ({ ...prev, leadingCharacter: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Synopsis</label>
            <textarea
              required
              value={formData.story}
              onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 h-32"
            />
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