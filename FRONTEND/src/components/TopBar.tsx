import { Search, Moon, Sun, RefreshCw, User, LogOut, Users } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { UserManagementModal } from './UserManagementModal';
import { ProfileModal } from './ProfileModal';
import { useState } from 'react';

interface TopBarProps {
  onRefresh: () => void;
}

export function TopBar({ onRefresh }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-cyan-500/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 dark:shadow-cyan-400/30 animate-pulse">
                <span className="text-white font-bold text-xl">IT</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 dark:from-cyan-400 dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Asset Hub
              </h1>
            </div>
          </div>

          <div className="flex-1 max-w-2xl mx-8 hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 transition-colors group-hover:text-cyan-500" />
              <input
                type="text"
                placeholder="Search assets, equipment, POCs..."
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-100/80 dark:bg-gray-800/50 border border-gray-200 dark:border-cyan-500/20
                focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 dark:focus:border-cyan-400
                text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400
                transition-all duration-300 backdrop-blur-sm
                hover:border-cyan-400 dark:hover:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onRefresh}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800/50 hover:bg-gradient-to-br hover:from-cyan-500/20 hover:to-blue-500/20
              border border-gray-200 dark:border-cyan-500/20 hover:border-cyan-400 dark:hover:border-cyan-500
              transition-all duration-300 group hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20"
            >
              <RefreshCw className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-cyan-500 dark:group-hover:text-cyan-400 group-hover:rotate-180 transition-all duration-500" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 dark:from-cyan-400/20 dark:to-purple-400/20
              border border-cyan-300/50 dark:border-cyan-500/30 hover:border-cyan-400 dark:hover:border-cyan-400
              transition-all duration-300 group hover:scale-105 hover:shadow-lg hover:shadow-purple-500/30"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-cyan-500 group-hover:text-yellow-400 transition-colors group-hover:rotate-180 duration-500" />
              ) : (
                <Moon className="w-5 h-5 text-purple-600 group-hover:text-purple-700 transition-colors group-hover:-rotate-12 duration-300" />
              )}
            </button>

            <div className="relative group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 p-0.5 cursor-pointer hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/40">
                <div className="w-full h-full rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center">
                  <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                </div>
              </div>
              <div className="absolute right-0 mt-2 w-48 py-2 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-gray-200 dark:border-cyan-500/30 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300">
                <div
                  className="px-4 py-2 border-b border-gray-200 dark:border-gray-700/50 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  onClick={() => setIsProfileModalOpen(true)}
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                  <p className="text-xs font-semibold text-cyan-500 mt-1 uppercase">{user?.role}</p>
                </div>

                {(user?.role === 'admin' || user?.role === 'owner') && (
                  <button
                    onClick={() => setIsUserModalOpen(true)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 flex items-center space-x-2 transition-colors"
                  >
                    <Users className="w-4 h-4" />
                    <span>Manage Users</span>
                  </button>
                )}

                <button
                  onClick={logout}
                  className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center space-x-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <UserManagementModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
      <ProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} />
    </div>
  );
}
