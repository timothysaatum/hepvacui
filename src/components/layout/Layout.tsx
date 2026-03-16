import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Users, Pill, Building2, UserCog,
  Monitor, Settings, Bell, LogOut, ChevronLeft,
  ChevronRight, Menu, X, Search, BarChart2,
} from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }
interface NavItem {
  name: string; path: string; icon: React.ElementType; adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Patients', path: '/patients', icon: Users },
  { name: 'Vaccines', path: '/vaccines', icon: Pill },
  { name: 'Records', path: '/records', icon: Search },
  { name: 'Reports', path: '/reports', icon: BarChart2, adminOnly: true },
  { name: 'Facilities', path: '/facilities', icon: Building2, adminOnly: true },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Staff', path: '/staff', icon: UserCog, adminOnly: true },
  { name: 'Devices', path: '/devices', icon: Monitor, adminOnly: true },
  { name: 'Settings', path: '/settings', icon: Settings, adminOnly: true },
];

function getInitials(name?: string | null) {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.roles?.some(r => r.name.toLowerCase() === 'admin');
  const filteredNav = NAV_ITEMS.filter(item => !item.adminOnly || isAdmin);
  const mainNav = filteredNav.filter(i => !i.adminOnly && i.path !== '/settings');
  const adminNav = filteredNav.filter(i => i.adminOnly && i.path !== '/settings');
  const settingsNav = filteredNav.filter(i => i.path === '/settings');
  const roleName = user?.roles?.[0]?.name ?? 'Staff';

  const currentPage = NAV_ITEMS.find(item =>
    location.pathname === item.path || location.pathname.startsWith(item.path + '/')
  );

  const handleLogout = async () => { await logout(); navigate('/login'); };
  const isActive = (path: string) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  // ── Sidebar inner content ─────────────────────────────────────────────────
  const SidebarInner = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex flex-col h-full">

      {/* Brand */}
      <div className={`h-14 flex items-center border-b border-slate-100 shrink-0 ${collapsed && !mobile ? 'justify-center' : 'px-4 gap-3'
        }`}>
        <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-[11px] tracking-tight">D4H</span>
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0">
            <p className="text-white font-semibold text-sm leading-none">Drive4Health</p>
            <p className="text-slate-500 text-[10px] leading-none mt-1 tracking-[0.15em] uppercase">Drive4Health</p>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={`p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-100 transition-colors ${collapsed ? 'ml-0' : 'ml-auto'
              }`}
          >
            {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
          </button>
        )}
        {mobile && (
          <button
            onClick={() => setMobileOpen(false)}
            className="ml-auto p-1 rounded-md text-slate-500 hover:text-slate-300 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">

        {/* Main */}
        <div>
          {(!collapsed || mobile) && (
            <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em]">
              Main
            </p>
          )}
          <ul className="space-y-0.5">
            {mainNav.map(item => (
              <NavLink key={item.path} item={item} active={isActive(item.path)}
                collapsed={collapsed && !mobile} onClick={mobile ? () => setMobileOpen(false) : undefined} />
            ))}
          </ul>
        </div>

        {/* Admin */}
        {adminNav.length > 0 && (
          <div>
            {(!collapsed || mobile) && (
              <p className="px-2.5 mb-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.12em]">
                Admin
              </p>
            )}
            {(collapsed && !mobile) && <div className="border-t border-slate-100 my-2 mx-1" />}
            <ul className="space-y-0.5">
              {adminNav.map(item => (
                <NavLink key={item.path} item={item} active={isActive(item.path)}
                  collapsed={collapsed && !mobile} onClick={mobile ? () => setMobileOpen(false) : undefined} />
              ))}
            </ul>
          </div>
        )}

        {/* Settings — always at bottom of nav area */}
        <div className="pt-2 border-t border-slate-100">
          <ul className="space-y-0.5">
            {settingsNav.map(item => (
              <NavLink key={item.path} item={item} active={isActive(item.path)}
                collapsed={collapsed && !mobile} onClick={mobile ? () => setMobileOpen(false) : undefined} />
            ))}
          </ul>
        </div>
      </nav>

      {/* User profile */}
      <div className="shrink-0 border-t border-slate-100 p-3">
        {collapsed && !mobile ? (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
              <span className="text-slate-700 font-semibold text-xs">{getInitials(user?.full_name)}</span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
              <span className="text-slate-700 font-semibold text-xs">{getInitials(user?.full_name)}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-800 truncate leading-none">{user?.full_name}</p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">{user?.email}</p>
            </div>
            <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
              {roleName}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">

      {/* Desktop sidebar */}
      <aside className={`hidden lg:block shrink-0 bg-white transition-all duration-300 ease-in-out ${collapsed ? 'w-[68px]' : 'w-56'
        }`}>
        <SidebarInner />
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-60 bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
        <SidebarInner mobile />
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Top bar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-5 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-sm">
              <span className="text-slate-400 hidden sm:block">Drive4Health</span>
              {currentPage && (
                <>
                  <span className="text-slate-300 hidden sm:block text-xs">/</span>
                  <span className="font-semibold text-slate-800">{currentPage.name}</span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Facility badge */}
            {user?.facility && (
              <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="text-xs font-medium text-slate-600 max-w-[180px] truncate">
                  {user.facility.facility_name}
                </span>
              </div>
            )}

            {/* Notifications */}
            <button className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full ring-2 ring-white" />
            </button>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-transparent hover:border-red-100 transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// ── NavLink component ─────────────────────────────────────────────────────────

function NavLink({
  item, active, collapsed, onClick,
}: {
  item: NavItem; active: boolean; collapsed: boolean; onClick?: () => void;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        to={item.path}
        onClick={onClick}
        title={collapsed ? item.name : undefined}
        className={`relative flex items-center rounded-lg transition-all duration-150 group
          ${collapsed ? 'justify-center py-2.5' : 'px-3 py-2 gap-3'}
          ${active
            ? 'bg-slate-900 text-white'
            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
      >
        {/* Active indicator bar */}
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-slate-900 rounded-r-full" />
        )}

        <Icon className={`w-[17px] h-[17px] shrink-0 ${active ? 'text-white' : ''}`} />

        {!collapsed && (
          <span className={`text-sm font-medium leading-none ${active ? 'text-white' : ''}`}>
            {item.name}
          </span>
        )}

        {/* Collapsed tooltip */}
        {collapsed && (
          <div className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-slate-900 border border-slate-800 text-slate-100 text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-xl">
            {item.name}
            <span className="absolute right-full top-1/2 -translate-y-1/2 border-[5px] border-transparent border-r-slate-900" />
          </div>
        )}
      </Link>
    </li>
  );
}