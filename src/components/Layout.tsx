import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { useFirebaseNotifications } from '../hooks/useFirebaseNotifications';
import { requestNotificationPermission } from '../service/firebase';
import { removeDeviceToken, syncDeviceToken } from '../service/notification';
import NotificationToastContainer from './NotificationToastContainer';
import {
  LayoutDashboard, Users, Car, Calendar,
  LogOut, Menu, X, Bell, BellOff, ChevronDown, ClipboardCheck, CarIcon,
  Clock, FileText,
  Building, Shield, MessageSquare, Mail, ShieldCheck, AlertTriangle, Tag
} from 'lucide-react';

type NotifPermission = 'granted' | 'denied' | 'default' | 'unsupported';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const [enabling, setEnabling] = useState(false);
  const [notifPermission, setNotifPermission] = useState<NotifPermission>(
    typeof Notification === 'undefined' ? 'unsupported' : (Notification.permission as NotifPermission)
  );

  const { notifications, unreadCount, markAsRead } = useNotifications();
  const recentNotifications = notifications.slice(0, 5);

  // Initialize Firebase notifications
  useFirebaseNotifications();

  // Keep permission state fresh (e.g. user changes it via browser site settings)
  useEffect(() => {
    if (typeof Notification === 'undefined') return;
    const interval = setInterval(() => {
      setNotifPermission(Notification.permission as NotifPermission);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleEnableNotifications = async () => {
    setEnabling(true);
    try {
      const token = await requestNotificationPermission();
      setNotifPermission(Notification.permission as NotifPermission);
      if (token) {
        localStorage.setItem('fcm_token', token);
        try {
          await syncDeviceToken(token);
        } catch (err) {
          console.error('Error syncing FCM token to backend:', err);
        }
      }
    } finally {
      setEnabling(false);
    }
  };

  const handleNotificationItemClick = (notification: typeof recentNotifications[number]) => {
    markAsRead(notification.id);
    setBellOpen(false);
    if (notification.link) {
      navigate(notification.link);
    } else {
      navigate('/notifications');
    }
  };

  // Different navigation based on user role
  const getNavigation = () => {

    if (user?.role === 'inspector') {
      return [
        { name: 'Inspections', href: '/my-inspections', icon: ClipboardCheck },
        { name: 'My Offers', href: '/my-offers', icon: Tag },
        { name: 'Notifications', href: '/notifications', icon: Bell },
      ];
    }

    if (user?.role === 'qa') {
      return [
        { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
        { name: 'Cars', href: '/cars', icon: Calendar },
        { name: 'Price Negotiation', href: '/price-reveal', icon: Tag },
        { name: 'Notifications', href: '/notifications', icon: Bell },
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
      { name: 'Sold Cars', href: '/cars?carType=sold', icon: CarIcon },
      { name: 'Appointments', href: '/appointments', icon: Calendar },
      { name: 'Trade-In Appointments', href: '/tradein-appointments', icon: Calendar },
      // { name: 'Valuations', href: '/valuations', icon: BadgeDollarSign },
      { name: 'Inspections', href: '/inspections', icon: ClipboardCheck },
      { name: 'Inspectors', href: '/inspectors', icon: Users },
      { name: 'QA', href: '/qa', icon: ShieldCheck },
      { name: 'Price Negotiation', href: '/price-reveal', icon: Tag },
      { name: 'Roles & Permissions', href: '/roles-permission', icon: ClipboardCheck },
      { name: 'Make and Model', href: '/make-and-model', icon: CarIcon },
      { name: 'Branch Timing', href: '/branch-timing', icon: Clock },
      { name: 'Branches', href: '/branches', icon: Building },
      { name: 'Notifications', href: '/notifications', icon: Bell },
      { name: 'Content Moderation', href: '/content-moderation', icon: Shield },
      { name: 'Leads', href: '/leads', icon: MessageSquare },
      { name: 'Buyer Seller Leads', href: '/buyer-seller-leads', icon: MessageSquare },
      { name: 'Contacts', href: '/contacts', icon: Mail },
      { name: 'Trade In Dealerships', href: '/tradein-dealerships', icon: CarIcon },
      { name: 'Invoicing', href: '/invoicing', icon: FileText },
    ];
  };

  const navigation = getNavigation();
  

     const fcmToken = async () => {
          const token = localStorage.getItem('fcm_token');
          if (token) {
            await removeDeviceToken(token);
          }
        };

  const handleLogout =  async () => {

   
    await fcmToken().catch(() => {});

    setTimeout(()=>{
  logout();
    navigate('/login');
    },0)

  
  };

  const getPageTitle = () => {
    const currentNav = navigation.find(item => item.href === location.pathname);
    return currentNav?.name || 'Dashboard';
  };

  return (
    <>
      <NotificationToastContainer />
      <div className="h-screen flex overflow-hidden bg-gray-100">
      {/* Mobile sidebar */}
      <div 
        className={`fixed inset-0 z-40 flex lg:hidden ${sidebarOpen ? 'visible' : 'invisible'}`}
        aria-hidden="true"
      >
        <div 
          className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ease-linear duration-300 ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-primary transform transition ease-in-out duration-300 ${
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
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col h-0 flex-1 bg-primary">
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
            className="px-4 border-r border-gray-200 text-gray-500 lg:hidden"
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
              {user && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setBellOpen(!bellOpen)}
                    className="relative p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <span className="sr-only">View notifications</span>
                    {notifPermission === 'granted' ? (
                      <Bell className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <BellOff className="h-6 w-6 text-amber-500" aria-hidden="true" />
                    )}

                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                    {unreadCount === 0 && notifPermission !== 'granted' && (
                      <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 bg-amber-500 rounded-full ring-2 ring-white" />
                    )}
                  </button>

                  {bellOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
                      <div
                        className="origin-top-right absolute right-0 mt-2 w-80 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20 overflow-hidden"
                      >
                      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-semibold text-gray-800 text-sm">Notifications</h3>
                        <button
                          onClick={() => { setBellOpen(false); navigate('/notifications'); }}
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View all
                        </button>
                      </div>

                      {notifPermission !== 'granted' && (
                        <div className="px-4 py-3 bg-amber-50 border-b border-amber-100 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            {notifPermission === 'denied' ? (
                              <>
                                <p className="text-xs font-medium text-amber-800">
                                  Notifications are blocked
                                </p>
                                <p className="text-xs text-amber-700 mt-0.5">
                                  You won't see new alerts pop up. Enable notifications for this site in your browser's address bar/settings, then reload.
                                </p>
                              </>
                            ) : notifPermission === 'unsupported' ? (
                              <p className="text-xs text-amber-700">
                                This browser doesn't support push notifications.
                              </p>
                            ) : (
                              <>
                                <p className="text-xs font-medium text-amber-800">
                                  Notifications are off
                                </p>
                                <p className="text-xs text-amber-700 mt-0.5 mb-2">
                                  Turn them on to get notified about new inspections and appointments in real time.
                                </p>
                                <button
                                  onClick={handleEnableNotifications}
                                  disabled={enabling}
                                  className="text-xs px-2.5 py-1 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-60"
                                >
                                  {enabling ? 'Enabling...' : 'Enable notifications'}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                        {recentNotifications.length === 0 ? (
                          <p className="px-4 py-6 text-center text-xs text-gray-400">
                            No notifications yet
                          </p>
                        ) : (
                          recentNotifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationItemClick(notification)}
                              className={`px-4 py-2.5 cursor-pointer ${
                                notification.read ? 'hover:bg-gray-50' : 'bg-blue-50/60 hover:bg-blue-50'
                              }`}
                            >
                              <p className={`text-sm ${notification.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{notification.body}</p>
                              <p className="text-[10px] text-gray-400 mt-1">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                      </div>
                    </>
                  )}
                </div>
              )}

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
    </>
  );
};

export default Layout;