import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Edit } from 'lucide-react';
import EditProfileModal from '../components/EditProfileModal';

export default function Profile() {
  const { userProfile, logout } = useAuth();
  const [readingStats, setReadingStats] = useState([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReadingStats = async () => {
      if (!userProfile) return;

      try {
        const now = new Date();
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const readingsQuery = query(
          collection(db, 'readings'),
          where('userId', '==', userProfile.id),
          where('date', '>=', last7Days[0])
        );

        const snapshot = await getDocs(readingsQuery);
        const readings = snapshot.docs.map(doc => ({
          date: doc.data().date,
          count: doc.data().chaptersRead
        }));

        const stats = last7Days.map(date => ({
          name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
          reads: readings.find(r => r.date === date)?.count || 0
        }));

        setReadingStats(stats);
      } catch (error) {
        console.error('Error fetching reading stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReadingStats();
  }, [userProfile]);

  if (!userProfile) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <p className="text-center">Please login to view your profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold">{userProfile.username}</h1>
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-1 text-orange-500 hover:text-orange-600"
              >
                <Edit className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
            <p className="text-gray-600 mt-2">Email: {userProfile.email}</p>
            <p className="text-gray-600">Age: {userProfile.age || 'Not specified'}</p>
            <p className="text-gray-600">
              Member since {new Date(userProfile.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Logout
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Reading Stats</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={readingStats}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="reads" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Favorite Genres</h2>
            <div className="flex flex-wrap gap-2">
              {userProfile.interestedGenres.map(genre => (
                <span
                  key={genre}
                  className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full"
                >
                  {genre}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showEditModal && (
        <EditProfileModal
          userProfile={userProfile}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            // Profile will be automatically updated through AuthContext
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}