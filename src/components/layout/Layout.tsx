import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  path: string;
  icon: string;
  adminOnly?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isAdmin = user?.roles?.some(role => role.name.toLowerCase() === 'admin');

  const navItems: NavItem[] = [
    { name: 'Dashboard', path: '/dashboard', icon: '📊' },
    { name: 'Patients', path: '/patients', icon: '👥' },
    { name: 'Vaccinations', path: '/vaccinations', icon: '💉' },
    { name: 'Vaccines', path: '/vaccines', icon: '🧪' },
    { name: 'Payments', path: '/payments', icon: '💳' },
    { name: 'Facilities', path: '/facilities', icon: '🏥', adminOnly: true },
    { name: 'Staff', path: '/staff', icon: '👨‍⚕️', adminOnly: true },
    { name: 'Devices', path: '/devices', icon: '🖥️', adminOnly: true },
    { name: 'Settings', path: '/settings', icon: '⚙️' },
  ];

  const filteredNavItems = navItems.filter(item => !item.adminOnly || isAdmin);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Brand */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <h1 className="text-xl font-bold text-blue-600">HepVac</h1>
          ) : (
            <span className="text-2xl">🏥</span>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md hover:bg-gray-100 text-gray-600"
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  {sidebarOpen && (
                    <span className="ml-3">{item.name}</span>
                  )}
                  {!sidebarOpen && item.adminOnly && (
                    <span className="absolute left-16 ml-2 px-2 py-1 bg-red-500 text-white text-xs rounded opacity-0 group-hover:opacity-100">
                      Admin
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="border-t border-gray-200 p-4">
          {sidebarOpen ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center min-w-0">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                    {user?.full_name?.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="ml-3 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.full_name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {user?.full_name?.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              {navItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            {/* Facility Badge */}
            {user?.facility && (
              <div className="hidden md:flex items-center px-3 py-1 bg-gray-100 rounded-full">
                <span className="text-sm text-gray-600">
                  🏥 {user.facility.facility_name}
                </span>
              </div>
            )}

            {/* Role Badge */}
            {isAdmin && (
              <span className="px-3 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded-full">
                Admin
              </span>
            )}

            {/* Notifications */}
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full relative">
              <span className="text-xl">🔔</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};