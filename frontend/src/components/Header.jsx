import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Menu,
  X,
  User,
  Sun,
  Moon,
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Clock,
  Settings,
  Users,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = user?.role?.toLowerCase().replace(/\s/g, '');

  const menuItems = {
    admin: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Manage Users', icon: Users, path: '/users' },
      { name: 'Projects', icon: FolderOpen, path: '/projects' },
      { name: 'Work Logs', icon: Clock, path: '/worklogs' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    coordinator: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'My Projects', icon: FolderOpen, path: '/my-projects' },
      { name: 'Team Overview', icon: Users, path: '/team-overview' },
      { name: 'Work Logs', icon: Clock, path: '/worklogs' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    teamlead: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'Task', icon: CheckSquare, path: '/tasks' },
      { name: 'Issue Tracking', icon: AlertCircle, path: '/issue-tracking' },
      { name: 'Work Logs', icon: Clock, path: '/worklogs' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
    employee: [
      { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
      { name: 'My Tasks', icon: CheckSquare, path: '/my-tasks' },
      { name: 'Time Tracking', icon: Clock, path: '/worklogs' },
      { name: 'Settings', icon: Settings, path: '/settings' },
    ],
  };

  const filteredMenu = menuItems[role] || [];

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700 px-4 py-3 md:px-6">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center space-x-2 md:hidden">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
            <CheckSquare className="h-5 w-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-gray-900 dark:text-white">DexPro</span>
        </div>

        {/* Desktop profile (left) */}
        <div className="hidden md:flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="flex items-baseline space-x-1">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{user?.name}</h1>
            <h3 className="text-sm text-gray-500 dark:text-gray-400 capitalize">({user?.role})</h3>
          </div>
        </div>

        {/* Right controls */}
        <div className="flex items-center space-x-3 md:hidden">
          <button
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        <div className="hidden md:flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <button
            onClick={logout}
            className="px-4 py-1.5 text-sm rounded-md bg-red-500 hover:bg-red-600 text-white transition"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 space-y-1">
         {/* <div className="inset-0 z-40 md:hidden mt-3 bg-white dark:bg-gray-900 shadow-lg overflow-auto"> */}
          {filteredMenu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-2 px-4 py-2 text-sm rounded-md font-medium transition-all ${
                  isActive
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
              onClick={() => setMobileMenuOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}
          <div className="mt-4 space-y-2">
  {/* Theme Toggle */}
  <div
    onClick={toggleTheme}
    className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all"
  >
    {isDark ? (
      <>
        <Sun className="h-4 w-4 mr-2" />
        <span>Light Mode</span>
      </>
    ) : (
      <>
        <Moon className="h-4 w-4 mr-2" />
        <span>Dark Mode</span>
      </>
    )}
  </div>

  {/* Logout Link */}
  <div
    onClick={logout}
    className="flex items-center w-full px-3 py-2 rounded-md text-sm font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 transition-all"
  >
    <User className="h-4 w-4 mr-2" />
    <span>Logout</span>
  </div>
</div>
        </div>
      )}
    </header>
  );
};

export default Header;