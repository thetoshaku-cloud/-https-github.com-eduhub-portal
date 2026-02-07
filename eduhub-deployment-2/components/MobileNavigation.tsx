
import React, { useState } from 'react';
import { ViewState, User } from '../types';
import { Home, Search, FileText, User as UserIcon, LogOut, ChevronLeft, Bell, Menu, X } from 'lucide-react';

// --- Custom Icon ---
const CalabashIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M7 21a5 5 0 0 0 10 0" />
    <path d="M12 21v-2" />
    <path d="M12 19a7 7 0 0 1 7-7c0-2.5-2-4-3-4V4a2 2 0 0 0-4 0v4c-1 0-3 1.5-3 4a7 7 0 0 1 7 7z" />
    <path d="M9 4h6" />
  </svg>
);

// --- Top Bar with Menu ---
interface MobileTopBarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  currentUser: User | null;
  onLogout: () => void;
  applicationCount: number;
}

export const MobileTopBar: React.FC<MobileTopBarProps> = ({ currentView, onNavigate, currentUser, onLogout, applicationCount }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getTitle = () => {
    switch (currentView) {
      case 'institutions': return 'Explore';
      case 'apply': return 'Application';
      case 'dashboard': return 'Status';
      case 'register': return 'Sign Up';
      case 'login': return 'Login';
      default: return null;
    }
  };

  const title = getTitle();
  const showBack = currentView !== 'landing' && currentView !== 'dashboard';

  const handleNavigate = (view: ViewState) => {
    setIsMenuOpen(false);
    onNavigate(view);
  };

  const handleLogoutClick = () => {
    setIsMenuOpen(false);
    onLogout();
  };

  return (
    <>
      <div className="bg-stone-50/80 backdrop-blur-md h-16 flex items-center justify-between px-5 sticky top-0 z-30 border-b border-stone-100">
        <div className="flex items-center">
          {showBack ? (
            <button 
              onClick={() => onNavigate('landing')}
              className="p-2 -ml-2 mr-2 text-stone-500 hover:text-orange-600 bg-white rounded-full shadow-sm active:scale-95 transition"
            >
              <ChevronLeft size={20} />
            </button>
          ) : (
            <div className="mr-3 bg-orange-100 p-2 rounded-full text-orange-600">
              <CalabashIcon className="h-5 w-5" />
            </div>
          )}
          
          {title ? (
             <h1 className="font-bold text-xl text-stone-800">{title}</h1>
          ) : (
             <h1 className="font-bold text-xl text-stone-800 tracking-tight">Edu<span className="text-orange-600">Hub</span></h1>
          )}
        </div>

        <div className="flex items-center gap-2">
          {currentUser && (
            <button className="relative p-2 text-stone-400 hover:text-stone-800 transition">
               <Bell size={22} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
          )}
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 text-stone-800 hover:bg-stone-100 rounded-full transition active:scale-95"
          >
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Menu Overlay */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-stone-50 animate-fadeIn flex flex-col">
           {/* Menu Header */}
           <div className="h-16 flex items-center justify-between px-5 border-b border-stone-100 bg-white">
              <div className="flex items-center">
                 <div className="mr-3 bg-stone-900 p-2 rounded-full text-white">
                    <CalabashIcon className="h-5 w-5" />
                 </div>
                 <h2 className="font-bold text-xl text-stone-800">Menu</h2>
              </div>
              <button 
                onClick={() => setIsMenuOpen(false)}
                className="p-2 text-stone-500 hover:bg-stone-100 rounded-full transition active:scale-95"
              >
                <X size={24} />
              </button>
           </div>

           {/* Menu Items */}
           <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-3">
              <MenuLink 
                 icon={Home} 
                 label="Home" 
                 onClick={() => handleNavigate('landing')}
                 isActive={currentView === 'landing'}
              />
              <MenuLink 
                 icon={Search} 
                 label="Explore Institutions" 
                 onClick={() => handleNavigate('institutions')}
                 isActive={currentView === 'institutions'}
              />
              <MenuLink 
                 icon={FileText} 
                 label="My Application" 
                 onClick={() => handleNavigate(currentUser ? (applicationCount > 0 ? 'apply' : 'dashboard') : 'login')}
                 isActive={currentView === 'apply' || currentView === 'dashboard'}
                 badge={currentUser ? applicationCount : 0}
              />
              <MenuLink 
                 icon={UserIcon} 
                 label={currentUser ? 'My Profile' : 'Login / Register'} 
                 onClick={() => handleNavigate(currentUser ? 'dashboard' : 'login')}
                 isActive={currentView === 'login' || currentView === 'register'}
              />

              {currentUser && (
                <div className="mt-8 pt-8 border-t border-stone-200">
                    <button 
                        onClick={handleLogoutClick}
                        className="w-full flex items-center p-4 rounded-2xl text-stone-500 hover:bg-red-50 hover:text-red-600 transition font-bold"
                    >
                        <div className="p-2 rounded-full mr-4 bg-stone-100 group-hover:bg-red-100">
                            <LogOut size={20} />
                        </div>
                        Sign Out
                    </button>
                </div>
              )}
           </div>
           
           <div className="p-6 text-center text-xs text-stone-400">
              <p>EduHub Version 1.0.0</p>
           </div>
        </div>
      )}
    </>
  );
};

// Helper Component for Menu Links
const MenuLink = ({ icon: Icon, label, onClick, isActive, badge }: any) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center p-4 rounded-2xl transition-all active:scale-95 ${
            isActive 
            ? 'bg-orange-50 text-orange-800 shadow-sm border border-orange-100' 
            : 'text-stone-600 hover:bg-stone-100 border border-transparent'
        }`}
    >
        <div className={`p-2 rounded-full mr-4 ${isActive ? 'bg-orange-100 text-orange-600' : 'bg-stone-100 text-stone-500'}`}>
            <Icon size={20} />
        </div>
        <span className="font-bold text-base flex-1 text-left">{label}</span>
        {badge > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full min-w-[20px] h-[20px] flex items-center justify-center">
                {badge}
            </span>
        )}
    </button>
);
