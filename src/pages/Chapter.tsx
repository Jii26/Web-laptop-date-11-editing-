import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Chapter } from '../types';

export default function ChapterPage() {
  const { novelId, chapterId } = useParams();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [hasReachedBottom, setHasReachedBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapter = async () => {
      if (!novelId || !chapterId) return;

      try {
        const chapterDoc = await getDoc(doc(db,  <boltAction type="file" filePath="src/pages/Chapter.tsx">'novels', novelId, 'chapters', chapterId));
        if (chapterDoc.exists()) {
          setChapter({ id: chapterDoc.id, ...chapterDoc.data() } as Chapter);
        }
      } catch (error) {
        console.error('Error fetching chapter:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChapter();
  }, [novelId, chapterId]);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || hasReachedBottom) return;

      const { scrollTop, scrollHeight, clientHeight } = contentRef.current;
      const isBottom = Math.ceil(scrollTop + clientHeight) >= scrollHeight;

      if (isBottom && !hasReachedBottom) {
        setHasReachedBottom(true);
        // Increment chapter views only when user reaches the bottom
        if (novelId && chapterId) {
          updateDoc(doc(db, 'novels', novelId, 'chapters', chapterId), {
            views: increment(1)
          });
        }
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (contentElement) {
        contentElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, [hasReachedBottom, novelId, chapterId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-center text-gray-600">Chapter not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-2">Chapter {chapter.chapterNumber}</h1>
        <h2 className="text-xl text-gray-600 mb-8">{chapter.title}</h2>
        
        <div 
          ref={contentRef} 
          className="prose max-w-none overflow-y-auto max-h-[70vh]"
        >
          {chapter.content.split('\n').map((paragraph, index) => (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Views: {chapter.views}</p>
          <p>Upload Date: {new Date(chapter.uploadDate).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}