

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Clock,
  Settings,
  Users,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user } = useAuth();
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
    <aside className="hidden md:block w-64 min-h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <CheckSquare className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            DexPro
          </span>
        </div>

        <nav className="space-y-2">
          {filteredMenu.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-white'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`
              }
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
