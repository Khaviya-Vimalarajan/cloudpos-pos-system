import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, updateUser } from '../store/authSlice';
import { toggleTheme, setSearchQuery } from '../store/uiSlice';
import Logo from './Logo';
import { 
  LayoutDashboard, Monitor, Package, Boxes, Users, Truck, 
  UserSquare2, Receipt, BarChart3, Settings, Building2, 
  LogOut, Bell, Sun, Moon, Menu, X, Search, ChevronDown, User, Shield, ShieldAlert, Camera, Loader2
} from 'lucide-react';
import api from '../utils/api';

export default function Layout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((state) => state.auth);
  const { theme, searchQuery } = useSelector((state) => state.ui);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissedIds, setDismissedIds] = useState(() => {
    try {
      const saved = localStorage.getItem('dismissedNotifications');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const dismissNotification = (id) => {
    const updated = [...dismissedIds, id];
    setDismissedIds(updated);
    localStorage.setItem('dismissedNotifications', JSON.stringify(updated));
  };

  // Profile Edit States
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditImage(user.profileImage || '');
    }
  }, [user, showProfileModal]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      alert('Name cannot be empty.');
      return;
    }
    setSavingProfile(true);
    try {
      const { data } = await api.put('/auth/profile', { name: editName, profileImage: editImage });
      dispatch(updateUser(data.user));
      setIsEditingProfile(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  // Initialize theme class on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Fetch alerts/notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user) return;
      try {
        let alerts = [];
        if (user.role === 'SuperAdmin') {
          const { data } = await api.get('/admin/notifications');
          alerts = data.map(item => ({
            id: item.id,
            type: 'NewBusiness',
            message: item.message
          }));
        } else {
          const { data } = await api.get('/inventory/low-stock');
          alerts = data.map(item => ({
            id: item._id,
            type: 'LowStock',
            message: `Low Stock: '${item.name}' has only ${item.stock} left (threshold: ${item.minStockAlert}).`
          }));
        }

        // Cleanup dismissed IDs in localStorage that are no longer active
        setDismissedIds((prev) => {
          const activeAlertIds = alerts.map(a => a.id);
          const cleaned = prev.filter(id => activeAlertIds.includes(id));
          localStorage.setItem('dismissedNotifications', JSON.stringify(cleaned));
          return cleaned;
        });

        setNotifications(alerts);
      } catch (err) {
        console.error('Error fetching alerts', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // refresh every minute
    return () => clearInterval(interval);
  }, [user]);

  const handleLogout = async () => {
    try {
      if (localStorage.getItem('accessToken')) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // ignore
    }
    navigate('/');
    setTimeout(() => {
      dispatch(logout());
    }, 0);
  };

  const getNavigationLinks = () => {
    if (!user) return [];

    switch (user.role) {
      case 'SuperAdmin':
        return [
          { name: 'Businesses', path: '/admin', icon: Building2 },
          { name: 'System Logs', path: '/admin/logs', icon: Receipt },
        ];
      
      case 'BusinessOwner':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'POS Terminal', path: '/pos', icon: Monitor },
          { name: 'Products', path: '/products', icon: Package },
          { name: 'Inventory & Stock', path: '/inventory', icon: Boxes },
          { name: 'Customers', path: '/customers', icon: Users },
          { name: 'Suppliers', path: '/suppliers', icon: Truck },
          { name: 'Staff Management', path: '/employees', icon: UserSquare2 },
          { name: 'Expenses', path: '/expenses', icon: Receipt },
          { name: 'Reports & Analytics', path: '/reports', icon: BarChart3 },
          { name: 'Activity Logs', path: '/activity-logs', icon: ShieldAlert },
          { name: 'Settings', path: '/settings', icon: Settings },
        ];
      
      case 'Cashier':
        return [
          { name: 'POS Terminal', path: '/pos', icon: Monitor },
          { name: 'Sales Logs', path: '/sales', icon: Receipt },
        ];

      case 'InventoryManager':
        return [
          { name: 'Products', path: '/products', icon: Package },
          { name: 'Inventory & Stock', path: '/inventory', icon: Boxes },
          { name: 'Suppliers', path: '/suppliers', icon: Truck },
          { name: 'Activity Logs', path: '/activity-logs', icon: ShieldAlert },
        ];
      
      default:
        return [];
    }
  };

  const navLinks = getNavigationLinks();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 font-sans">
      
      {/* SIDEBAR FOR DESKTOP */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 transform flex flex-col h-full border-r bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800/50 transition-transform duration-300 md:translate-x-0 md:static md:inset-0 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/60 dark:border-slate-800/50">
          <div className="flex items-center gap-2.5">
            <Logo className="h-8.5 w-8.5 shadow-lg shadow-brand-500/10 rounded-xl" />
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300">
              CloudPOS
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1 px-4 py-6 overflow-y-auto">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/15' 
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout (Fixed at bottom) */}
        <div className="p-4 border-t border-slate-200/60 dark:border-slate-800/50 bg-white dark:bg-slate-900">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* BACKDROP FOR MOBILE */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm md:hidden"
        />
      )}

      {/* MAIN CONTAINER */}
      <div className="flex flex-1 flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="relative z-30 flex h-16 items-center justify-between px-6 border-b bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border-slate-200/60 dark:border-slate-800/50">
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Quick Search */}
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products, orders..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-64 rounded-xl bg-slate-100 dark:bg-slate-950/50 pl-10 pr-4 py-2 text-xs border border-transparent focus:border-slate-300 dark:focus:border-slate-800 outline-none transition-all text-slate-800 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <button
              onClick={() => dispatch(toggleTheme())}
              className="rounded-xl p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/40 dark:border-slate-800/40"
            >
              {theme === 'dark' ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
            </button>

            {/* Notifications Popover */}
            <div className="relative">
              {(() => {
                const activeNotifications = notifications.filter(item => !dismissedIds.includes(item.id));
                return (
                  <>
                    <button
                      onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                      className="relative rounded-xl p-2.5 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-slate-200/40 dark:border-slate-800/40"
                    >
                      <Bell className="h-4.5 w-4.5" />
                      {activeNotifications.length > 0 && (
                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500" />
                      )}
                    </button>

                    {isNotificationsOpen && (
                      <div className="absolute right-0 mt-2 w-80 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl z-50 p-4 animate-fade-in">
                        <div className="flex items-center justify-between border-b pb-2 mb-3 dark:border-slate-800">
                          <span className="font-semibold text-sm">Alerts & Notifications</span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                            {activeNotifications.length} Alerts
                          </span>
                        </div>
                        <div className="space-y-3 max-h-60 overflow-y-auto">
                          {activeNotifications.length === 0 ? (
                            <p className="text-xs text-slate-400 text-center py-4">No new notifications</p>
                          ) : (
                            activeNotifications.map(item => (
                              <div key={item.id} className="relative p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs">
                                <button
                                  onClick={() => dismissNotification(item.id)}
                                  className="absolute top-2 right-2 p-1 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-all"
                                  title="Dismiss notification"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                                <span className="font-medium text-red-600 dark:text-red-400 block mb-1">
                                  {item.type === 'LowStock' ? 'Stock Warning' : 'System Alert'}
                                </span>
                                <span className="text-slate-600 dark:text-slate-300 pr-5 block">{item.message}</span>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800/70 border border-transparent hover:border-slate-200/40 dark:hover:border-slate-800/40 transition-all"
              >
                <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-violet-500 text-white font-bold overflow-hidden shadow-inner">
                  {user?.profileImage ? (
                    <img src={user.profileImage} alt={user.name} className="h-full w-full object-cover" />
                  ) : (
                    user?.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden text-left md:block">
                  <span className="block text-xs font-semibold text-slate-800 dark:text-slate-200">{user?.name}</span>
                  <span className="block text-[10px] text-slate-500 capitalize">{user?.role}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl z-50 py-2 animate-fade-in">
                  <div className="px-4 py-3 border-b dark:border-slate-800">
                    <span className="block text-sm font-semibold">{user?.name}</span>
                    <span className="block text-xs text-slate-500 truncate">{user?.email}</span>
                  </div>
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        setShowProfileModal(true);
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setIsProfileOpen(false);
                        handleLogout();
                      }}
                      className="flex w-full items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* MAIN BODY SCROLL CONTAINER */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950/40">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>

      {/* MY PROFILE DETAILS MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-5 animate-slide-up">
            <div className="flex items-center justify-between border-b pb-2 dark:border-slate-800">
              <span className="font-bold text-sm">My User Profile Settings</span>
              <button 
                onClick={() => {
                  setShowProfileModal(false);
                  setIsEditingProfile(false);
                }} 
                className="text-slate-400 font-bold hover:text-slate-650"
              >
                ×
              </button>
            </div>

            {/* Profile Picture Upload Section */}
            <div className="flex flex-col items-center gap-3">
              <div className="relative h-20 w-20 rounded-full border border-slate-200 dark:border-slate-800 bg-gradient-to-tr from-brand-600 to-violet-500 text-white flex items-center justify-center text-3xl font-bold shadow-md">
                {editImage ? (
                  <div className="h-full w-full rounded-full overflow-hidden">
                    <img src={editImage} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                ) : (
                  editName?.charAt(0).toUpperCase()
                )}
                {isEditingProfile && (
                  <label htmlFor="profile-upload" className="absolute bottom-0 right-0 h-6.5 w-6.5 bg-brand-500 hover:bg-brand-600 text-white rounded-full flex items-center justify-center cursor-pointer shadow-md border-2 border-white dark:border-slate-900 transition-colors">
                    <Camera className="h-3.5 w-3.5" />
                  </label>
                )}
              </div>
              {isEditingProfile && (
                <>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageUpload} 
                    className="hidden" 
                    id="profile-upload"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('profile-upload').click()}
                    className="text-[10px] text-brand-500 hover:text-brand-600 font-semibold"
                  >
                    Change Photo
                  </button>
                </>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30">
                <span className="text-slate-500 font-semibold">Full Name</span>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="rounded-lg border px-3 py-1 text-xs bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-brand-500 font-bold w-48 text-right"
                  />
                ) : (
                  <span className="font-bold text-slate-800 dark:text-slate-200">{user?.name}</span>
                )}
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30">
                <span className="text-slate-500 font-semibold">Email Address</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30">
                <span className="text-slate-500 font-semibold">User Role</span>
                <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold uppercase">{user?.role}</span>
              </div>
              {user?.role !== 'SuperAdmin' && (
                <div className="flex justify-between items-center p-3 rounded-xl bg-slate-100/50 dark:bg-slate-900/30">
                  <span className="text-slate-500 font-semibold">Tenant Scope ID</span>
                  <span className="font-mono text-[9px] font-bold text-slate-400">{user?.businessId}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              {isEditingProfile ? (
                <>
                  <button
                    disabled={savingProfile}
                    onClick={() => {
                      setIsEditingProfile(false);
                      setEditName(user?.name || '');
                      setEditImage(user?.profileImage || '');
                    }}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs px-5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    disabled={savingProfile}
                    onClick={handleSaveProfile}
                    className="rounded-xl bg-brand-500 text-white font-semibold text-xs px-5 py-2 hover:bg-brand-600 shadow-md transition-colors flex items-center gap-1.5"
                  >
                    {savingProfile && <Loader2 className="h-3 w-3 animate-spin" />}
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="rounded-xl border border-slate-200 dark:border-slate-800 font-semibold text-xs px-5 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="rounded-xl bg-brand-500 text-white font-semibold text-xs px-5 py-2 hover:bg-brand-600 shadow-md transition-colors"
                  >
                    Close Profile
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
