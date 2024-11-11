import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { GENRES, Novel } from '../types';
import { PlusCircle, Edit, BookPlus } from 'lucide-react';
import EditNovelModal from '../components/EditNovelModal';
import AddChapterModal from '../components/AddChapterModal';

export default function Write() {
  const { userProfile } = useAuth();
  const [myNovels, setMyNovels] = useState<Novel[]>([]);
  const [showNewNovelForm, setShowNewNovelForm] = useState(false);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [addingChapterToNovel, setAddingChapterToNovel] = useState<Novel | null>(null);
  const [lastChapterNumbers, setLastChapterNumbers] = useState<Record<string, number>>({});
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: [],
    leadingCharacter: 'male',
    story: ''
  });

  useEffect(() => {
    if (userProfile) {
      const fetchMyNovels = async () => {
        const q = query(collection(db, 'novels'), where('uploadBy', '==', userProfile.id));
        const snapshot = await getDocs(q);
        const novels = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Novel));
        setMyNovels(novels);

        // Fetch last chapter numbers
        const chapterNumbers: Record<string, number> = {};
        for (const novel of novels) {
          const chaptersQuery = query(
            collection(db, 'novels', novel.id, 'chapters'),
            where('chapterNumber', '>', 0)
          );
          const chaptersSnapshot = await getDocs(chaptersQuery);
          const numbers = chaptersSnapshot.docs.map(doc => doc.data().chapterNumber);
          chapterNumbers[novel.id] = Math.max(0, ...numbers);
        }
        setLastChapterNumbers(chapterNumbers);
      };
      fetchMyNovels();
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile) return;

    try {
      await addDoc(collection(db, 'novels'), {
        ...formData,
        uploadBy: userProfile.id,
        views: 0,
        createdAt: serverTimestamp()
      });
      setShowNewNovelForm(false);
      setFormData({ title: '', author: '', genre: [], leadingCharacter: 'male', story: '' });
      // Refresh novels list
      const q = query(collection(db, 'novels'), where('uploadBy', '==', userProfile.id));
      const snapshot = await getDocs(q);
      setMyNovels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Novel)));
    } catch (error) {
      console.error('Error creating novel:', error);
    }
  };

  if (!userProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center">Please login to write novels.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Novels</h1>
        <button
          onClick={() => setShowNewNovelForm(true)}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
        >
          <PlusCircle className="h-5 w-5" />
          Create New Novel
        </button>
      </div>

      {showNewNovelForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg mb-8">
          <h2 className="text-2xl font-bold mb-6">Create New Novel</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Author</label>
              <input
                type="text"
                required
                value={formData.author}
                onChange={(e) => setFormData(prev => ({ ...prev, author: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Genres (max 3)</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Leading Character</label>
              <select
                value={formData.leadingCharacter}
                onChange={(e) => setFormData(prev => ({ ...prev, leadingCharacter: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Synopsis</label>
              <textarea
                required
                value={formData.story}
                onChange={(e) => setFormData(prev => ({ ...prev, story: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-orange-500 focus:border-orange-500 h-32"
              />
            </div>

            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => setShowNewNovelForm(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
              >
                Create Novel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myNovels.map(novel => (
          <div key={novel.id} className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-2">{novel.title}</h3>
            <p className="text-gray-600 mb-2">by {novel.author}</p>
            <div className="flex gap-2 mb-4">
              {novel.genre.map(g => (
                <span key={g} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                  {g}
                </span>
              ))}
            </div>
            <p className="text-gray-600 mb-4 line-clamp-3">{novel.story}</p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{novel.views} views</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setAddingChapterToNovel(novel)}
                  className="flex items-center gap-1 text-orange-500 hover:text-orange-600"
                >
                  <BookPlus className="h-4 w-4" />
                  Add Chapter
                </button>
                <button 
                  onClick={() => setEditingNovel(novel)}
                  className="flex items-center gap-1 text-orange-500 hover:text-orange-600"
                >
                  <Edit className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingNovel && (
        <EditNovelModal
          novel={editingNovel}
          isOpen={!!editingNovel}
          onClose={() => setEditingNovel(null)}
          onUpdate={() => {
            // Refresh novels list
            if (userProfile) {
              const fetchMyNovels = async () => {
                const q = query(collection(db, 'novels'), where('uploadBy', '==', userProfile.id));
                const snapshot = await getDocs(q);
                setMyNovels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Novel)));
              };
              fetchMyNovels();
            }
          }}
        />
      )}

      {addingChapterToNovel && (
        <AddChapterModal
          novelId={addingChapterToNovel.id}
          isOpen={!!addingChapterToNovel}
          onClose={() => setAddingChapterToNovel(null)}
          lastChapterNumber={lastChapterNumbers[addingChapterToNovel.id] || 0}
          onAdd={() => {
            // Update last chapter number
            setLastChapterNumbers(prev => ({
              ...prev,
              [addingChapterToNovel.id]: (prev[addingChapterToNovel.id] || 0) + 1
            }));
          }}
        />
      )}
    </div>
  );
}