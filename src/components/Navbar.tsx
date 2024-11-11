import React from 'react';
import { Link } from 'react-router-dom';
import { Search, BookOpen, Library, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { userProfile } = useAuth();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <BookOpen className="h-8 w-8 text-orange-500" />
            <span className="ml-2 text-2xl font-bold text-orange-500">Mantra Novels</span>
          </Link>
          
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Search novels..."
                className="w-full px-4 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <Search className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div className="flex items-center space-x-6">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/explore" className="nav-link">Explore</Link>
            <Link to="/ranking" className="nav-link">Ranking</Link>
            <Link to="/write" className="nav-link">Write</Link>
            <Link to={userProfile ? "/library" : "/auth"} className="flex items-center nav-link">
              <Library className="h-5 w-5 mr-1" />
              <span>Library</span>
            </Link>
            {userProfile ? (
              <Link to="/profile" className="flex items-center nav-link">
                <User className="h-5 w-5 mr-1" />
                <span>Profile</span>
              </Link>
            ) : (
              <Link to="/auth" className="nav-link">Login/Signup</Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}