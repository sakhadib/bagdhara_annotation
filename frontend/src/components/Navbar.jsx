import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDrawerOpen(false);
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <>
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Brand */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-serif font-semibold text-gray-800 hover:text-blue-600 transition duration-200">
                bagdhara
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              {isAuthenticated() ? (
                // Authenticated Navigation
                <>
                  <Link
                    to="/dashboard"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-200"
                  >
                    Dashboard
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded text-sm font-medium transition duration-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Unauthenticated Navigation
                <>
                  <Link
                    to="/"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-200"
                  >
                    Home
                  </Link>
                  
                  <Link
                    to="/login"
                    className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium transition duration-200"
                  >
                    Login
                  </Link>
                  
                  <Link
                    to="/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition duration-200 cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={toggleDrawer}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 cursor-pointer"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isDrawerOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black bg-opacity-25" onClick={closeDrawer}></div>
          
          {/* Drawer Panel */}
          <div className="fixed top-0 right-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <span className="text-lg font-serif font-semibold text-gray-800">bagdhara</span>
              <button
                onClick={closeDrawer}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 cursor-pointer"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-4 space-y-4">
              {isAuthenticated() ? (
                // Authenticated Navigation
                <>
                  <Link
                    to="/dashboard"
                    onClick={closeDrawer}
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium transition duration-200"
                  >
                    Dashboard
                  </Link>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded text-base font-medium transition duration-200 cursor-pointer"
                  >
                    Logout
                  </button>
                </>
              ) : (
                // Unauthenticated Navigation
                <>
                  <Link
                    to="/"
                    onClick={closeDrawer}
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium transition duration-200"
                  >
                    Home
                  </Link>
                  
                  <Link
                    to="/login"
                    onClick={closeDrawer}
                    className="block text-gray-700 hover:text-blue-600 px-3 py-2 text-base font-medium transition duration-200"
                  >
                    Login
                  </Link>
                  
                  <Link
                    to="/signup"
                    onClick={closeDrawer}
                    className="block bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-base font-medium transition duration-200 text-center cursor-pointer"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
