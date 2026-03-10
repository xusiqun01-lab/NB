import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Sparkles, 
  History, 
  User, 
  LogOut, 
  Menu,
  X,
  Shield,
  Settings,
  Zap
} from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: '生成', icon: Zap },
    { path: '/history', label: '历史', icon: History },
    { path: '/settings', label: 'API设置', icon: Settings },
  ];

  if (user?.role === 'admin') {
    navItems.push({ path: '/admin', label: '管理', icon: Shield });
  }

  return (
    <nav className="bg-dark-bg/80 backdrop-blur-xl border-b border-dark-border sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-banana to-amber-600 rounded-xl flex items-center justify-center shadow-glow-sm group-hover:shadow-glow transition-shadow">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl text-white tracking-tight">
                香蕉 AI
              </span>
              <span className="text-[10px] text-gray-500 -mt-1">专业图像生成</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated && navItems.map((item) => (
              <Button
                key={item.path}
                variant={isActive(item.path) ? 'default' : 'ghost'}
                size="sm"
                onClick={() => navigate(item.path)}
                className={isActive(item.path) 
                  ? 'bg-banana text-black hover:bg-banana-dark font-medium' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
                }
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <span className="hidden md:block text-sm text-gray-500">
                  {user?.email}
                </span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full border border-dark-border hover:border-banana/50 hover:bg-banana/10 transition-colors"
                    >
                      <div className="w-8 h-10 bg-gradient-to-br from-banana/20 to-orange-500/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-banana" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-dark-card border-dark-border">
                    <div className="px-3 py-2 text-sm font-medium text-white border-b border-dark-border mb-1 md:hidden">
                      {user?.email}
                    </div>
                    
                    <div className="md:hidden">
                      {navItems.map((item) => (
                        <DropdownMenuItem 
                          key={item.path} 
                          onClick={() => navigate(item.path)}
                          className="text-gray-300 focus:text-white focus:bg-banana/10 cursor-pointer"
                        >
                          <item.icon className="w-4 h-4 mr-2" />
                          {item.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator className="bg-dark-border" />
                    </div>
                    
                    <DropdownMenuItem 
                      onClick={logout} 
                      className="text-red-400 focus:text-red-400 focus:bg-red-500/10 cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => navigate('/login')}
                  className="text-gray-400 hover:text-white"
                >
                  登录
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => navigate('/register')}
                  className="bg-banana text-black hover:bg-banana-dark font-medium"
                >
                  注册
                </Button>
              </div>
            )}

            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-gray-400 hover:text-white"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-dark-border py-4">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  variant={isActive(item.path) ? 'default' : 'ghost'}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={isActive(item.path) 
                    ? 'bg-banana text-black hover:bg-banana-dark justify-start' 
                    : 'text-gray-400 hover:text-white justify-start'
                  }
                >
                  <item.icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
