import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Shield, 
  Users, 
  Activity, 
  Building, 
  BarChart3, 
  Settings,
  Bell,
  User,
  Menu,
  X,
  LogOut,
  Home
} from 'lucide-react';
import ThemeToggle from '../../components/common/ThemeToggle';

const AdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-neutral-600 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700';
  };

  const handleLogout = () => {
    // Clear admin session
    localStorage.removeItem('adminUser');
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: <Home className="w-5 h-5 mr-3" /> },
    { name: 'User Management', path: '/admin/users', icon: <Users className="w-5 h-5 mr-3" /> },
    { name: 'Vaccination Oversight', path: '/admin/vaccinations', icon: <Shield className="w-5 h-5 mr-3" /> },
    { name: 'Facility Management', path: '/admin/facilities', icon: <Building className="w-5 h-5 mr-3" /> },
    { name: 'Analytics & Reports', path: '/admin/analytics', icon: <BarChart3 className="w-5 h-5 mr-3" /> },
    { name: 'API Management', path: '/admin/api', icon: <Activity className="w-5 h-5 mr-3" /> },
    { name: 'System Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5 mr-3" /> },
  ];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col">
      {/* Header */}
      <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-30">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button 
                className="md:hidden mr-2 p-2 rounded-md text-neutral-500 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <Link to="/admin/dashboard" className="flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 transition-colors">
                <Shield className="h-8 w-8 mr-2" />
                <div>
                  <span className="text-xl font-bold">MedFiNet</span>
                  <span className="block text-xs text-neutral-500 dark:text-neutral-400">Admin Portal</span>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              
              <Link to="/admin/notifications" className="p-2 rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-primary-500 ring-2 ring-white dark:ring-neutral-800"></span>
              </Link>
              
              <div className="flex items-center space-x-3 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg p-2 transition-colors">
                <div className="h-8 w-8 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center text-primary-600 dark:text-primary-400">
                  <User className="h-5 w-5" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-neutral-900 dark:text-white">Admin User</p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">System Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-20 bg-black bg-opacity-25" onClick={toggleMobileMenu}>
            <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-white dark:bg-neutral-800 shadow-lg" onClick={e => e.stopPropagation()}>
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive(item.path)}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  ))}
                </div>
                <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex">
        {/* Sidebar - desktop */}
        <aside className="hidden md:flex md:flex-shrink-0">
          <div className="flex flex-col w-64 border-r border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${isActive(item.path)}`}
                  >
                    {item.icon}
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 p-4 border-t border-neutral-200 dark:border-neutral-700">
              <button
                onClick={handleLogout}
                className="w-full flex items-center px-3 py-2 rounded-md text-sm font-medium text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-900/20"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Logout
              </button>
            </div>
          </div>
        </aside>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;