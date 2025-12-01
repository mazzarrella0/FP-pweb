import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { LibraryLogo } from '../Logo/LibraryLogo';
import { getCurrentUser } from '../../features/auth/api/authApi';
import { logout as logoutApi } from '../../features/auth/api/authApi';
import type { PublicUser } from '@react-express-library/shared';

export const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } catch (error) {
        console.error('Failed to load user:', error);
      }
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logoutApi();
      navigate('/login');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <Link to="/books" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-12 h-12">
              <LibraryLogo />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold text-dark-blue">Library Catalog</h1>
              <p className="text-xs text-gray-500">Online Book Management</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              to="/books"
              className="text-gray-700 hover:text-dark-blue font-medium transition-colors"
            >
              Books
            </Link>
            <Link
              to="/transactions"
              className="text-gray-700 hover:text-dark-blue font-medium transition-colors"
            >
              Transactions
            </Link>

            {/* User Info & Logout */}
            <div className="flex items-center gap-4 ml-4 pl-4 border-l border-gray-300">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-700">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-3">
              <Link
                to="/books"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Books
              </Link>
              <Link
                to="/transactions"
                onClick={() => setIsMenuOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Transactions
              </Link>
              <div className="px-4 py-2 border-t border-gray-200 mt-2">
                <p className="text-sm font-medium text-gray-700">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-gray-500 mb-3">{user?.email}</p>
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
