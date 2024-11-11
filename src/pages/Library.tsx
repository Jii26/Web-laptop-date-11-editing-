import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import NovelCard from '../components/NovelCard';

export default function Library() {
  const { userProfile } = useAuth();
  const [novels, setNovels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLibrary = async () => {
      if (!userProfile) return;

      try {
        const libraryRef = collection(db, 'users', userProfile.id, 'library');
        const snapshot = await getDocs(libraryRef);
        
        const novelPromises = snapshot.docs.map(async (doc) => {
          const novelDoc = await getDocs(doc(db, 'novels', doc.data().novelId));
          return { id: novelDoc.id, ...novelDoc.data() };
        });

        const novelsData = await Promise.all(novelPromises);
        setNovels(novelsData);
      } catch (error) {
        console.error('Error fetching library:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLibrary();
  }, [userProfile]);

  if (!userProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center">Please login to view your library.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Library</h1>
      
      {novels.length === 0 ? (
        <p className="text-center text-gray-600">Your library is empty. Start adding novels!</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {novels.map(novel => (
            <NovelCard key={novel.id} novel={novel} />
          ))}
        </div>
      )}
    </div>
  );
}