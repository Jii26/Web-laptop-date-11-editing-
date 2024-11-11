import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, orderBy, getDocs, updateDoc, increment, deleteDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import type { Novel, Chapter } from '../types';
import { BookOpen, Heart, Share2, Eye } from 'lucide-react';

export default function NovelDetail() {
  const { id } = useParams();
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInLibrary, setIsInLibrary] = useState(false);

  useEffect(() => {
    const fetchNovel = async () => {
      if (!id) return;

      try {
        const novelDoc = await getDoc(doc(db, 'novels', id));
        if (novelDoc.exists()) {
          setNovel({ id: novelDoc.id, ...novelDoc.data() } as Novel);

          // Increment view count
          await updateDoc(doc(db, 'novels', id), {
            views: increment(1)
          });

          const chaptersQuery = query(
            collection(db, 'novels', id, 'chapters'),
            orderBy('chapterNumber')
          );
          const chaptersSnapshot = await getDocs(chaptersQuery);
          const chaptersData = chaptersSnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as Chapter)
          );
          setChapters(chaptersData);

          // Check if novel is in user's library
          if (userProfile) {
            const libraryDoc = await getDoc(doc(db, 'users', userProfile.id, 'library', id));
            setIsInLibrary(libraryDoc.exists());
          }
        }
      } catch (error) {
        console.error('Error fetching novel:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNovel();
  }, [id, userProfile]);

  const toggleLibrary = async () => {
    if (!userProfile || !novel) {
      navigate('/auth');
      return;
    }

    try {
      const libraryRef = doc(db, 'users', userProfile.id, 'library', novel.id);
      if (isInLibrary) {
        await deleteDoc(libraryRef);
      } else {
        await setDoc(libraryRef, { novelId: novel.id, addedAt: new Date() });
      }
      setIsInLibrary(!isInLibrary);
    } catch (error) {
      console.error('Error updating library:', error);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: novel?.title,
        text: novel?.story,
        url: window.location.href
      });
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Novel not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex gap-8">
        {/* Left: Cover Image */}
        <div className="w-64 flex-shrink-0">
          {novel.novelCoverPage ? (
            <img
              src={novel.novelCoverPage}
              alt={novel.title}
              className="w-full rounded-lg shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg shadow-lg p-6 flex flex-col justify-center items-center text-white">
              <h3 className="text-2xl font-bold text-center mb-4">{novel.title}</h3>
              <p className="text-lg opacity-90">by {novel.author}</p>
            </div>
          )}
        </div>

        {/* Right: Novel Info */}
        <div className="flex-1">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{novel.title}</h1>
          <p className="text-xl text-gray-600 mb-4">by {novel.author}</p>

          <div className="flex gap-4 mb-6">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-gray-500" />
              <span>{chapters.length} Chapters</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-gray-500" />
              <span>{novel.views} Views</span>
            </div>
          </div>

          <div className="flex gap-4 mb-8">
            {novel.genre.map((g) => (
              <span
                key={g}
                className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
              >
                {g}
              </span>
            ))}
          </div>

          <div className="flex gap-4 mb-8">
            {chapters.length > 0 && (
              <Link
                to={`/novel/${novel.id}/chapter/${chapters[0].id}`}
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                Start Reading
              </Link>
            )}
            <button
              onClick={toggleLibrary}
              className={`flex items-center gap-2 px-6 py-2 border rounded-full transition-colors ${
                isInLibrary
                  ? 'bg-orange-500 text-white border-orange-500'
                  : 'border-orange-500 text-orange-500 hover:bg-orange-50'
              }`}
            >
              <Heart className={`h-5 w-5 ${isInLibrary ? 'fill-current' : ''}`} />
              {isInLibrary ? 'In Library' : 'Add to Library'}
            </button>
            <button 
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors"
            >
              <Share2 className="h-5 w-5" />
              Share
            </button>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-xl font-semibold mb-4">Synopsis</h3>
            <p className="text-gray-700 whitespace-pre-line">{novel.story}</p>
          </div>
        </div>
      </div>

      {/* Chapters List */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Chapters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chapters.map((chapter) => (
            <Link
              key={chapter.id}
              to={`/novel/${novel.id}/chapter/${chapter.id}`}
              className="p-4 border rounded-lg hover:border-orange-500 transition-colors"
            >
              <h3 className="font-semibold">Chapter {chapter.chapterNumber}</h3>
              <p className="text-gray-600">{chapter.title}</p>
              <div className="flex items-center gap-2 mt-2 text-sm text-gray-500">
                <Eye className="h-4 w-4" />
                <span>{chapter.views}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}