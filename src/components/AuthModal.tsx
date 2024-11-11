import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { GENRES } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        if (selectedGenres.length > 3) {
          setError('Please select up to 3 genres');
          return;
        }
        await register(email, password, username, parseInt(age), selectedGenres);
      }
      onClose();
    } catch (err) {
      setError('Failed to ' + (isLogin ? 'login' : 'register'));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
        >
          <X className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">
          {isLogin ? 'Login' : 'Create Account'}
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
            />
          </div>

          {!isLogin && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Age</label>
                <input
                  type="number"
                  required
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interested Genres (max 3)
                </label>
                <div className="flex flex-wrap gap-2">
                  {GENRES.map((genre) => (
                    <button
                      key={genre}
                      type="button"
                      onClick={() => {
                        setSelectedGenres((prev) =>
                          prev.includes(genre)
                            ? prev.filter((g) => g !== genre)
                            : prev.length < 3
                            ? [...prev, genre]
                            : prev
                        );
                      }}
                      className={`px-3 py-1 rounded-full text-sm ${
                        selectedGenres.includes(genre)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
          >
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 text-sm text-orange-600 hover:text-orange-700"
        >
          {isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}
        </button>
      </div>
    </div>
  );
}