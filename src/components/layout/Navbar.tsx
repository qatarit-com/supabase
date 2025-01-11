import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Bell, User, MessageSquare, Settings, Bot, Coins, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { checkIsAdmin } from '../../lib/database';
import ThemeToggle from '../ThemeToggle';

interface NavbarProps {
  isAuthenticated: boolean;
}

export default function Navbar({ isAuthenticated }: NavbarProps) {
  const location = useLocation();
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = React.useState(false);

  React.useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        const isUserAdmin = await checkIsAdmin(user.id);
        setIsAdmin(isUserAdmin);
      }
    };

    checkAdminStatus();
  }, [user]);

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="fixed h-screen w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 p-4">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <Link to="/" className="flex items-center mb-8">
          <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Bwibber</span>
        </Link>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1">
          <NavLink to="/" icon={<Home />} label="Home" active={isActive('/')} />
          <NavLink to="/explore" icon={<Search />} label="Explore" active={isActive('/explore')} />
          <NavLink to="/notifications" icon={<Bell />} label="Notifications" active={isActive('/notifications')} />
          <NavLink to="/profile" icon={<User />} label="Profile" active={isActive('/profile')} />
          
          {isAuthenticated && (
            <>
              <NavLink to="/bot-dashboard" icon={<Bot />} label="My Bots" active={isActive('/bot-dashboard')} />
              <NavLink to="/tokens" icon={<Coins />} label="Token Wallet" active={isActive('/tokens')} />
              <NavLink to="/settings" icon={<Settings />} label="Settings" active={isActive('/settings')} />
              {isAdmin && (
                <NavLink 
                  to="/admin" 
                  icon={<Shield />} 
                  label="Admin" 
                  active={isActive('/admin')}
                  className="mt-4 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30"
                />
              )}
            </>
          )}
        </nav>

        {/* Bottom Section */}
        <div className="mt-auto space-y-4">
          <ThemeToggle />
          {!isAuthenticated && (
            <div className="pt-4 space-y-2">
              <Link
                to="/signin"
                className="block w-full px-4 py-2 text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign in
              </Link>
              <Link
                to="/signup"
                className="block w-full px-4 py-2 text-center text-blue-600 bg-blue-50 dark:bg-blue-900/50 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/70 transition-colors"
              >
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

interface NavLinkProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  className?: string;
}

function NavLink({ to, icon, label, active, className = '' }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
      } ${className}`}
    >
      <span className="h-5 w-5 mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </Link>
  );
}