import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Briefcase, Bell, ChevronDown, LogOut, User as UserIcon, Settings, PlusCircle } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'recruiter') return '/recruiter';
    return '/dashboard';
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-2 rounded-lg">
              <Briefcase className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
              CareerConnect
            </span>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/jobs" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">
              Find Jobs
            </Link>
            <Link to="/internships" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">
              Internships
            </Link>
            <Link to="/companies" className="text-gray-600 hover:text-primary-600 font-medium text-sm transition-colors">
              Companies
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <>
                {user.role === 'recruiter' && (
                  <Link to="/recruiter" className="hidden sm:inline-flex items-center gap-1.5 btn-primary text-xs py-1.5 px-3">
                    <PlusCircle className="h-4 w-4" /> Recruiter Hub
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="hidden sm:inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg">
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={() => navigate('/dashboard')}
                  className="relative p-2 text-gray-500 hover:text-primary-600 transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                </button>

                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-sm text-gray-700 hover:text-primary-600 transition-colors focus:outline-none"
                  >
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center border border-primary-200">
                      <span className="text-primary-700 font-semibold text-xs">
                        {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                      </span>
                    </div>
                    <span className="hidden md:block font-medium">{user.firstName}</span>
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-200 py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-xs font-semibold text-gray-900">{user.firstName} {user.lastName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        <span className="inline-block mt-1 badge bg-primary-100 text-primary-700 uppercase tracking-wider text-[10px]">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        to={getDashboardLink()}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <UserIcon className="h-4 w-4 mr-2 text-gray-400" /> Dashboard
                      </Link>
                      <button
                        onClick={() => { setDropdownOpen(false); logout(); }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="h-4 w-4 mr-2" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary text-sm">Sign In</Link>
                <Link to="/register" className="btn-primary text-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
