import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import NovelDetail from './pages/NovelDetail';
import Write from './pages/Write';
import Library from './pages/Library';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Ranking from './pages/Ranking';
import Auth from './pages/Auth';

const App: React.FC = () => {
  return (
    <Router>
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/novel/:id" element={<NovelDetail />} />
            <Route path="/write" element={<Write />} />
            <Route path="/library" element={<Library />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
};

export default App;