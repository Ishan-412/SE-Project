// src/components/Navbar.jsx
import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const authContext = useAuth();

  // prevent crash while auth is loading
  if (!authContext) {
    return (
      <nav className="navbar bg-white shadow-md p-4">
        <span>Loading...</span>
      </nav>
    );
  }

  const { currentUser, logout, loading } = authContext;
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  if (loading) return null;

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-lg font-bold text-gray-800"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <i className="fas fa-file-alt text-white text-sm"></i>
            </div>
            <span>GenLinked</span>
          </Link>

          {/* Desktop Navigation */}
          {currentUser && (
            <div className="hidden md:flex nav-links space-x-4">
              <Link
                to="/dashboard"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive("/dashboard")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <i className="fas fa-tachometer-alt mr-2"></i>
                Dashboard
              </Link>

              <Link
                to="/getArticles"
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive("/getArticles")
                    ? "text-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                <i className="fas fa-newspaper mr-2"></i>
                Articles
              </Link>
            </div>
          )}

          {/* Desktop Auth */}
          <div className="hidden md:flex items-center space-x-4">
            {currentUser ? (
              <>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <i className="fas fa-user-circle text-2xl"></i>
                  )}

                  <span className="hidden lg:inline">
                    {currentUser.displayName ||
                      currentUser.email?.split("@")[0]}
                  </span>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg hover:scale-105 transition"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-600 focus:outline-none"
            >
              {isOpen ? (
                <i className="fas fa-times text-xl"></i>
              ) : (
                <i className="fas fa-bars text-xl"></i>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {currentUser && (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base transition ${
                    isActive("/dashboard")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <i className="fas fa-tachometer-alt mr-3"></i>
                  Dashboard
                </Link>

                <Link
                  to="/getArticles"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center px-3 py-2 rounded-md text-base transition ${
                    isActive("/getArticles")
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                  }`}
                >
                  <i className="fas fa-newspaper mr-3"></i>
                  Articles
                </Link>
              </>
            )}

            {/* Mobile Auth */}
            <div className="border-t border-gray-200 pt-4 mt-4">
              {currentUser ? (
                <>
                  <div className="flex items-center px-3 py-2 space-x-3 text-gray-600">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <i className="fas fa-user-circle text-2xl"></i>
                    )}
                    <span>
                      {currentUser.displayName ||
                        currentUser.email?.split("@")[0]}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full mt-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsOpen(false)}
                  className="block w-full text-center bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold py-2 px-4 rounded-lg hover:shadow-lg transition"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
