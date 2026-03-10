import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, Image, Images, Users, Settings, Shield, 
  LogOut, Sparkles, Menu, X
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  generationCount: number;
}

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    
    // 获取用户信息
    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(data => {
      if (data.error) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setUser(data);
      }
    });
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const navItems = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/text2img', icon: Sparkles, label: '文生图' },
    { path: '/img2img', icon: Image, label: '图生图' },
    { path: '/multi', icon: Images, label: '多图参考' },
    { path: '/gallery', icon: Images, label: '图库' },
    { path: '/api-settings', icon: Settings, label: 'API设置' },
    ...(user?.role === 'admin' ? [{ path: '/admin', icon: Shield, label: '管理后台' }] : []),
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="flex h-screen bg-[var(--bg-primary)] overflow-hidden">
      {/* 侧边栏 */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 glass border-r border-[var(--border-color)] flex flex-col`}>
        {/* LOGO区域 */}
        <div className="p-6 flex items-center gap-3 border-b border-[var(--border-color)]">
          <div className="banana-logo text-4xl">🍌</div>
          {sidebarOpen && (
            <div>
              <h1 className="font-bold text-xl text-gradient">香蕉 AI</h1>
              <p className="text-xs text-[var(--text-muted)]">专业图像生成</p>
            </div>
          )}
        </div>

        {/* 导航菜单 */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <div
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <item.icon size={20} />
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-[var(--border-color)]">
          <div className={`flex items-center gap-3 mb-3 ${!sidebarOpen && 'justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-black font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.email}</p>
                <p className="text-xs text-[var(--text-muted)]">
                  {user?.role === 'admin' ? '超级管理员' : '普通用户'}
                </p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className={`flex items-center gap-2 text-[var(--text-muted)] hover:text-red-400 transition-colors ${!sidebarOpen && 'justify-center w-full'}`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>退出</span>}
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部栏 */}
        <header className="h-16 glass border-b border-[var(--border-color)] flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-[var(--text-muted)]">
              已生成 {user?.generationCount || 0} 张图片
            </span>
          </div>
        </header>

        {/* 内容 */}
        <div className="flex-1 overflow-auto p-6">
          {children}
        </div>
      </main>
    </div>
  );
};
