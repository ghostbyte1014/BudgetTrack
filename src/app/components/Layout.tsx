import { Link, Outlet, useLocation, useNavigate } from 'react-router';
import { useBudget } from '../contexts/BudgetContext';
import { 
  LayoutDashboard, 
  Receipt, 
  Calendar, 
  CreditCard, 
  TrendingUp,
  LogOut,
  Menu,
  X,
  HelpCircle,
  User,
  Bell,
  FileText,
  ShoppingCart
} from 'lucide-react';
import { Button } from './ui/button';
import { useState, useEffect } from 'react';
import { OnboardingTutorial } from './OnboardingTutorial';
import { toast } from 'sonner';
const navigation = [
  { name: 'The Pulse', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Market Run', href: '/market-run', icon: ShoppingCart },
  { name: 'The Vault', href: '/transactions', icon: Receipt },
  { name: 'The Bridge', href: '/history', icon: Calendar },
  { name: 'Fixed Costs', href: '/fixed-costs', icon: CreditCard },
  { name: 'The Forecast', href: '/analytics', icon: TrendingUp },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'How It Works', href: '/how-it-works', icon: HelpCircle },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Profile', href: '/profile', icon: User },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, unreadCount } = useBudget();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#09090b]">
      <OnboardingTutorial />
      {/* Desktop Sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow bg-[#18181b] border-r border-zinc-800">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-zinc-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-white font-semibold text-lg">BudgetFlow</span>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-zinc-800">
            <p className="text-sm text-zinc-400">Welcome back,</p>
            <p className="text-white font-medium">{user.name}</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href === '/market-run' ? '#' : item.href}
                  onClick={(e) => {
                    if (item.href === '/market-run') {
                      e.preventDefault();
                      toast.info('Market Run is currently in development for v4.0.0. A system notification will be issued upon deployment.', { icon: '🚧' });
                    }
                  }}
                  className={`
                    flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}
                  `}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-zinc-800">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-[#18181b] border-b border-zinc-800 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">B</span>
          </div>
          <span className="text-white font-semibold">BudgetFlow</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-white p-2"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-[#18181b]" style={{ top: '64px' }}>
          <div className="px-4 py-4 border-b border-zinc-800">
            <p className="text-sm text-zinc-400">Welcome back,</p>
            <p className="text-white font-medium">{user.name}</p>
          </div>
          <nav className="px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href === '/market-run' ? '#' : item.href}
                  onClick={(e) => {
                    if (item.href === '/market-run') {
                      e.preventDefault();
                      setMobileMenuOpen(false);
                      toast.info('Market Run is currently in development for v4.0.0. A system notification will be issued upon deployment.', { icon: '🚧' });
                    } else {
                      setMobileMenuOpen(false);
                    }
                  }}
                  className={`
                    flex items-center justify-between px-4 py-3 text-sm rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-emerald-600 text-white' 
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}
                  `}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                  {item.name === 'Notifications' && unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start text-zinc-400 hover:text-white hover:bg-zinc-800 mt-4"
            >
              <LogOut className="w-5 h-5 mr-3" />
              Logout
            </Button>
          </nav>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {!mobileMenuOpen && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-[#18181b] border-t border-zinc-800 flex items-center justify-around px-2">
          {navigation.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href === '/market-run' ? '#' : item.href}
                onClick={(e) => {
                  if (item.href === '/market-run') {
                    e.preventDefault();
                    toast.info('Market Run is currently in development for v4.0.0. A system notification will be issued upon deployment.', { icon: '🚧' });
                  }
                }}
                className={`flex flex-col items-center justify-center flex-1 h-full relative ${
                  isActive ? 'text-emerald-500' : 'text-zinc-400'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name === 'Notifications' && unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full" />
                )}
                <span className="text-xs mt-1">{item.name.split(' ')[1] || item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Main Content */}
      <main className="md:pl-64 pt-16 md:pt-0 pb-16 md:pb-0">
        <div className="p-4 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}