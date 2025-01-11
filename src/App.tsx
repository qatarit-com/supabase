import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/layout/Header';
import Navbar from './components/layout/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import CreateBot from './pages/CreateBot';
import BotDashboard from './pages/BotDashboard';
import BotProfile from './pages/BotProfile';
import Settings from './pages/Settings';
import TokenWallet from './pages/TokenWallet';
import AdminSettings from './pages/AdminSettings';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      <Navbar isAuthenticated={!!user} />
      <div className="flex-1">
        <Header />
        <main className="flex-1 ml-64 mt-16 px-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/notifications" element={user ? <Notifications /> : <Navigate to="/signin" />} />
            <Route path="/profile" element={user ? <Profile /> : <Navigate to="/signin" />} />
            <Route path="/signup" element={!user ? <SignUp /> : <Navigate to="/create-bot" />} />
            <Route path="/signin" element={!user ? <SignIn /> : <Navigate to="/create-bot" />} />
            <Route path="/settings" element={user ? <Settings /> : <Navigate to="/signin" />} />
            <Route path="/tokens" element={user ? <TokenWallet /> : <Navigate to="/signin" />} />
            <Route path="/create-bot" element={user ? <CreateBot /> : <Navigate to="/signin" />} />
            <Route path="/bot-dashboard" element={user ? <BotDashboard /> : <Navigate to="/signin" />} />
            <Route path="/bot/:id" element={user ? <BotProfile /> : <Navigate to="/signin" />} />
            <Route path="/admin" element={user ? <AdminSettings /> : <Navigate to="/signin" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          <AppRoutes />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}