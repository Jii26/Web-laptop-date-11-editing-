import React from 'react';
import { Link } from 'react-router-dom';
import type { Novel } from '../types';

interface NovelCardProps {
  novel: Novel;
}

export default function NovelCard({ novel }: NovelCardProps) {
  return (
    <Link to={`/novel/${novel.id}`} className="group">
      <div className="w-48 transition-transform duration-200 group-hover:scale-105">
        {novel.novelCoverPage ? (
          <img
            src={novel.novelCoverPage}
            alt={novel.title}
            className="w-full h-64 object-cover rounded-lg shadow-md"
          />
        ) : (
          <div className="w-full h-64 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg shadow-md p-4 flex flex-col justify-center items-center text-white">
            <h3 className="text-xl font-bold text-center mb-2">{novel.title}</h3>
            <p className="text-sm opacity-90">by {novel.author}</p>
          </div>
        )}
        <h3 className="mt-2 text-lg font-semibold text-gray-800 group-hover:text-orange-500">
          {novel.title}
        </h3>
        <p className="text-sm text-gray-600">{novel.author}</p>
      </div>
    </Link>
  );
}