'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLanguageStore } from '../../stores/languageStore';
import { 
  LayoutDashboard, 
  Library, 
  BrainCircuit, 
  BookOpen, 
  Network, 
  Activity, 
  BookA,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { userLanguages, activeLanguageId } = useLanguageStore();
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const activeLanguage = userLanguages.find(l => l.id === activeLanguageId);
  const isChineseOrJapanese = activeLanguage 
    ? ['zh', 'ja'].includes(activeLanguage.code.toLowerCase()) ||
      activeLanguage.name.toLowerCase().includes('chinese') ||
      activeLanguage.name.toLowerCase().includes('japanese') ||
      activeLanguage.name.toLowerCase().includes('trung') ||
      activeLanguage.name.toLowerCase().includes('nhật')
    : false;

  const navItems = [
    { name: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Danh mục từ', href: '/categories', icon: Library },
    { name: 'Ôn tập', href: '/review', icon: BrainCircuit },
    { name: 'Ngữ pháp', href: '/grammar', icon: BookOpen },
    { name: 'Cấu trúc câu', href: '/structures', icon: Network },
    { name: 'Đề kiểm tra', href: '/test-builder', icon: Activity },
    ...(isChineseOrJapanese ? [{ name: 'Bộ thủ chữ', href: '/radicals', icon: BookA }] : [])
  ];

  return (
    <aside className={`sticky top-16 left-0 h-[calc(100vh-4rem)] bg-slate-900 border-r border-slate-800 transition-all duration-300 flex flex-col z-30 ${isCollapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                isActive 
                  ? 'bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 text-emerald-400 border-l-4 border-emerald-400' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:scale-110'}`} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </div>

      <div className="p-3 border-t border-slate-800/80">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center justify-center w-full py-2 bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 text-slate-400 hover:text-slate-200 rounded-xl transition-all"
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>
    </aside>
  );
}
