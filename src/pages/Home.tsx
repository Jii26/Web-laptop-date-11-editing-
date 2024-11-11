import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Novel } from '../types';
import NovelCard from '../components/NovelCard';
import GenreCarousel from '../components/GenreCarousel';
import { Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { userProfile } = useAuth();
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        let q = query(
          collection(db, 'novels'),
          orderBy('views', 'desc'),
          limit(10)
        );

        if (selectedGenre !== 'All') {
          q = query(
            collection(db, 'novels'),
            where('genre', 'array-contains', selectedGenre),
            orderBy('views', 'desc'),
            limit(10)
          );
        }

        const snapshot = await getDocs(q);
        const novelsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Novel[];
        
        setNovels(novelsData);
      } catch (error) {
        console.error('Error fetching novels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, [selectedGenre]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative h-[400px] rounded-xl overflow-hidden mb-8">
        <img
          src="https://images.unsplash.com/photo-1457369804613-52c61a468e7d"
          alt="Library"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent flex items-center">
          <div className="text-white ml-16">
            <h1 className="text-5xl font-bold mb-4">Discover Amazing Stories</h1>
            <p className="text-xl mb-8">Explore thousands of web novels across multiple genres</p>
            <Link 
              to="/explore"
              className="inline-block bg-orange-500 text-white px-8 py-3 rounded-full font-semibold hover:bg-orange-600 transition-colors"
            >
              Start Reading
            </Link>
          </div>
        </div>
      </div>

      {/* Genre Carousel */}
      <div className="mb-8">
        <GenreCarousel
          selectedGenre={selectedGenre}
          onGenreSelect={setSelectedGenre}
        />
      </div>

      {/* Novels Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
        </div>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-6">
            {selectedGenre === 'All' ? 'Popular Novels' : `Top ${selectedGenre} Novels`}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {novels.map(novel => (
              <NovelCard key={novel.id} novel={novel} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}