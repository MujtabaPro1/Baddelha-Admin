import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, Users, Car, Calendar, 
  LogOut, Menu, X, Bell, ChevronDown, ClipboardCheck, CarIcon,
  Clock, FileText,
  Building, Shield, MessageSquare, Mail
} from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Different navigation based on user role
  const getNavigation = () => {

    if (user?.role === 'inspector') {
      return [
        { name: 'Inspections', href: '/my-inspections', icon: ClipboardCheck },
      ];
    }

    if (user?.role === 'qa') {
      return [
        { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
        { name: 'Cars', href: '/cars', icon: Calendar },
      ];
    }

    if (user?.role === 'sale') {
      return [
        { name: 'Cars', href: '/cars', icon: Calendar },
      ];
    }



    if (user?.role === 'supervisor') {
      return [
        { name: 'Inspections', href: '/supervisor-inspections', icon: ClipboardCheck },
        { name: 'Inspectors', href: '/inspectors', icon: Calendar },
      ];
    }
    
    // Admin navigation
    return [
      { name: 'Dashboard', href: '/', icon: LayoutDashboard },
      { name: 'Users', href: '/users', icon: Users },
      { name: 'Dealers', href: '/dealers', icon: Users },
      { name: 'Sellers', href: '/sellers', icon: Users },
      { name: 'Cars', href: '/cars', icon: Car },
      { name: 'Inventory Cars', href: '/inventory-cars', icon: CarIcon },
      { name: 'Appointments', href: '/appointments', icon: Calendar },
      { name: 'Trade-In Appointments', href: '/tradein-appointments', icon: Calendar },
      // { name: 'Valuations', href: '/valuations', icon: BadgeDollarSign },
      { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
      { name: 'Roles & Permissions', href: '/roles-permission', icon: ClipboardCheck },
      { name: 'Make and Model', href: '/make-and-model', icon: CarIcon },
      { name: 'Branch Timing', href: '/branch-timing', icon: Clock },
      { name: 'Branches', href: '/branches', icon: Building },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Content Moderation', href: '/content-moderation', icon: Shield },
      { name: 'Leads', href: '/leads', icon: MessageSquare },
      { name: 'Contacts', href: '/contacts', icon: Mail },
      { name: 'Trade In Dealerships', href: '/tradein-dealerships', icon: CarIcon },
      { name: 'Invoicing', href: '/invoicing', icon: FileText },
    ];
  };

  const navigation = getNavigation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    const currentNav = navigation.find(item => item.href === location.pathname);
    return currentNav?.name || 'Dashboard';
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 z-40 flex md:hidden ${sidebarOpen ? 'visible' : 'invisible'}`}
        aria-hidden="true"
      >
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-blue-900 transform transition ease-in-out duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <span className="sr-only">Close sidebar</span>
              <X className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4">
              <h1 className="text-2xl font-bold text-white">
                Baddelha {user?.role === 'inspector' ? 'Inspector' : 'Admin'}
              </h1>
            </div>
            <nav className="mt-5 px-2 space-y-1">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                      isActive
                        ? 'bg-blue-800 text-white'
                        : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                    }`}
                  >
                    <item.icon
                      className={`mr-4 flex-shrink-0 h-6 w-6 ${
                        isActive ? 'text-white' : 'text-blue-300'
                      }`}
                      aria-hidden="true"
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-blue-800 p-4">
            <button
              onClick={handleLogout}
              className="flex items-center text-blue-100 hover:text-white"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-blue-900">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-2xl font-bold text-white">
                  Baddelha {user?.role === 'inspector' ? 'Inspector' : 'Admin'}
                </h1>
              </div>
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-blue-800 text-white'
                          : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                      }`}
                    >
                      <item.icon
                        className={`mr-3 flex-shrink-0 h-6 w-6 ${
                          isActive ? 'text-white' : 'text-blue-300'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex-shrink-0 flex border-t border-blue-800 p-4">
              <button
                onClick={handleLogout}
                className="flex items-center text-blue-100 hover:text-white"
              >
                <LogOut className="mr-3 h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex items-center">
              <h2 className="text-xl font-semibold text-gray-800">
                {getPageTitle()}
              </h2>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {user?.role === 'admin' && <button className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                <span className="sr-only">View notifications</span>
                <Bell
                  onClick={() => navigate('/notifications')}
                  className="h-6 w-6" aria-hidden="true" />
              </button>}

              {/* Profile dropdown */}
              <div className="ml-3 relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-800 flex items-center justify-center text-white">
                      {user?.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-2 text-gray-700">{user?.name}</span>
                    <ChevronDown className="ml-1 h-4 w-4 text-gray-400" />
                  </button>
                </div>
                {dropdownOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;