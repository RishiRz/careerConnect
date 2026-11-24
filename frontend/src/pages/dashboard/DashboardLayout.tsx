import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  LayoutDashboard, User, FileText, Briefcase, ClipboardList, Settings, LogOut
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/dashboard/profile', label: 'Profile', icon: User },
  { to: '/dashboard/resume', label: 'Resumes', icon: FileText },
  { to: '/dashboard/applications', label: 'My Applications', icon: ClipboardList },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 text-primary-700 font-bold rounded-full flex items-center justify-center text-sm border border-primary-200">
              {user?.firstName?.[0] || 'U'}{user?.lastName?.[0] || ''}
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 font-bold'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 sm:p-8 max-w-6xl mx-auto overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
