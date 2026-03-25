import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, LayoutDashboard, BookOpen, Code2, MessageSquare, Settings, GraduationCap, Trophy } from 'lucide-react';
import { User } from '../types';

interface SidebarProps {
  user: User | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar = ({ user, activeTab, setActiveTab }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'resources', icon: BookOpen, label: 'Resources' },
    { id: 'practice', icon: CheckCircle2, label: 'DSA Practice' },
    { id: 'playground', icon: Code2, label: 'Coding Playground' },
    { id: 'mentor', icon: MessageSquare, label: 'AI Mentor' },
    { id: 'achievements', icon: Trophy, label: 'Achievements' },
    { id: 'settings', icon: Settings, label: 'Settings' },
  ];

  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-white border-r border-gray-100 flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-indigo-600 p-2 rounded-xl">
          <GraduationCap className="text-white w-6 h-6" />
        </div>
        <h1 className="font-bold text-xl text-gray-900 tracking-tight">EduMentor AI</h1>
      </div>

      <nav className="flex-1 px-4 mt-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              const route = item.id === 'dashboard' ? '/dashboard' : `/${item.id}`;
              navigate(route);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              activeTab === item.id
                ? 'bg-indigo-50 text-indigo-700 font-semibold'
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
          <img 
            src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName || 'User'}`} 
            alt="User" 
            className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.displayName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
