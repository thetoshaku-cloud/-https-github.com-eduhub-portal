import React, { useState, useEffect } from 'react';
import { MobileTopBar } from './components/MobileNavigation';
import { ViewState, ApplicationFormData, ApplicationRecord, User, InstitutionType } from './types';
import { INSTITUTIONS } from './constants';
import { InstitutionCard } from './components/InstitutionCard';
import { ApplicationForm } from './components/ApplicationForm';
import { ApplicationDetails } from './components/ApplicationDetails';
import { ChatAssistant } from './components/ChatAssistant';
import { Auth } from './components/Auth';
import { AdminDashboard } from './components/AdminDashboard';
import { databaseService } from './services/database';
import { ArrowRight, Search, CheckCircle, MessageCircle, Info, Clock, AlertCircle, Mail, UserPlus, Shield, FileText, Download, X, Award, FileSearch, ShieldCheck, Check, ExternalLink, Send, Eye } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(() => {
    databaseService.init(); // Async init
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('view') === 'admin') return 'admin';
    }
    return 'landing';
  });
  
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('All');
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  // State for viewing details modal
  const [viewingApplication, setViewingApplication] = useState<ApplicationRecord | null>(null);

  // Load user data
  useEffect(() => {
    databaseService.incrementVisits();
    
    const loadUserSession = async () => {
        const user = databaseService.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          // Fetch Apps Asynchronously
          try {
              const userApps = await databaseService.getUserApplications(user.id);
              if (userApps.length > 0) setApplications(userApps);
          } catch (e) { console.error("Could not load apps", e); }
        }
    };
    loadUserSession();

    const timer = setTimeout(() => {
        if (!isInstalling) setShowInstallBanner(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isInstalling]);

  const handleInstallApp = () => {
    setIsInstalling(true);
    setTimeout(() => {
        databaseService.incrementDownloads();
        localStorage.setItem('eduHub_isInstalled', 'true');
        setShowInstallBanner(false);
        setIsInstalling(false);
    }, 1000);
  };

  const handleLogin = async (user: User) => {
    setCurrentUser(user);
    const userApps = await databaseService.getUserApplications(user.id);
    setApplications(userApps);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    databaseService.logoutUser();
    setCurrentUser(null);
    setApplications([]);
    setCurrentView('landing');
  };

  const toggleInstitutionSelection = (id: string) => {
    setSelectedInstitutions(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleApplicationSubmit = async (data: ApplicationFormData) => {
    try {
        const newRecord = await databaseService.saveApplication(data, currentUser?.id);
        setApplications(prev => [newRecord, ...prev]);
        setCurrentView('dashboard');
        setSelectedInstitutions([]);
    } catch (e) {
        alert("Failed to submit application to server. Please check your connection.");
    }
  };

  const navigateTo = (view: ViewState) => {
    if ((view === 'apply' || view === 'dashboard') && !currentUser) {
      setCurrentView('login');
    } else {
      setCurrentView(view);
    }
  };

  const getApplicationStatus = (id: string) => {
    // Simplified status for all apps since there's no real backend integration for updates yet
    return {
        status: 'Applied',
        badgeClass: 'bg-purple-100 text-purple-700 border-purple-200',
        barClass: 'bg-gradient-to-r from-pink-500 to-purple-500', // Vibrant gradient bar
        borderClass: 'border-purple-500',
        progress: 100,
        step: 'Application Sent',
        timeline: 'Awaiting Response',
        icon: <CheckCircle size={14} className="text-green-600 mr-2" />,
        mainIcon: <Send size={22} className="text-purple-600" />,
        iconBg: 'bg-purple-100'
    };
  };

  const filteredInstitutions = INSTITUTIONS.filter(inst => {
    const matchesSearch = inst.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          inst.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'All' || inst.type === filterType;
    return matchesSearch && matchesType;
  });

  const activeApplication = applications.length > 0 ? applications[0] : null;

  const openAdminPortal = () => {
      setCurrentView('admin');
      if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('view', 'admin');
          window.history.pushState({}, '', url);
      }
  };

  const closeAdminPortal = () => {
      setCurrentView('landing');
      if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          window.history.pushState({}, '', url);
      }
  };

  const Hero = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="relative z-10 pb-8">
        <main className="mt-8 mx-auto max-w-7xl px-4">
          <div className="text-center">
            <h1 className="text-3xl tracking-tight font-extrabold text-gray-900 sm:text-4xl">
              <span className="block">Your Hub to Access</span>{' '}
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">Higher Education.</span>
            </h1>
            <p className="mt-4 text-base text-gray-600 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto">
              One app for all your applications. Universities, TVETs, and NSFAS. Simple.
            </p>
            <div className="mt-8 flex flex-col gap-3 px-4">
              {currentUser ? (
                <button
                  onClick={() => navigateTo(selectedInstitutions.length > 0 ? 'apply' : 'institutions')}
                  className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-full text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-300 transition-all transform active:scale-95"
                >
                  {selectedInstitutions.length > 0 ? (
                    <>Resume Application <ArrowRight size={20} className="ml-2" /></>
                  ) : (
                    'Start Applying'
                  )}
                </button>
              ) : (
                <button
                    onClick={() => setCurrentView('register')}
                    className="w-full flex items-center justify-center px-6 py-4 border border-transparent text-base font-bold rounded-full text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-300 transition-all transform active:scale-95"
                >
                    <UserPlus className="mr-2" size={20}/> Create Account
                </button>
              )}
            </div>
            <div className="mt-8 pt-4 border-t border-purple-200/60 w-3/4 mx-auto">
                 <button 
                    onClick={openAdminPortal}
                    className="group w-full flex flex-col items-center justify-center p-3 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer"
                >
                    <div className="flex items-center gap-2 text-purple-400 group-hover:text-purple-700 transition-colors">
                        <Shield size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">Institution Admin Portal</span>
                        <ExternalLink size={12} />
                    </div>
                    <span className="text-[10px] text-purple-300 group-hover:text-purple-500 mt-1">
                        Restricted Access • Staff Only
                    </span>
                </button>
            </div>
          </div>
        </main>
      </div>
      <div className="relative h-56 w-full mt-4 mx-auto max-w-[90%] rounded-3xl overflow-hidden shadow-xl shadow-purple-200">
        <img
          className="h-full w-full object-cover opacity-90"
          src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          alt="Students learning"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent"></div>
        <div className="absolute bottom-4 left-6 text-white">
            <p className="font-bold text-lg">Your Future Awaits</p>
            <p className="text-xs text-white/90">Apply to 20+ institutions today.</p>
        </div>
      </div>
    </div>
  );

  if (currentView === 'admin') {
      return (
          <div className="min-h-screen bg-gray-100 font-sans">
              <AdminDashboard onBack={closeAdminPortal} />
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 font-sans flex justify-center items-center sm:py-8">
       <div className="w-full max-w-[420px] bg-white h-[100dvh] sm:h-[850px] sm:rounded-[40px] sm:border-[12px] sm:border-purple-600 shadow-2xl overflow-hidden relative flex flex-col">
            
            {showInstallBanner && currentView === 'landing' && (
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 flex items-center justify-between z-40 animate-slideUp m-2 rounded-2xl shadow-xl">
                    <div className="flex items-center">
                        <div className={`p-2 rounded-xl mr-3 transition-colors ${isInstalling ? 'bg-green-500' : 'bg-yellow-400'}`}>
                            {isInstalling ? <Check size={18} className="text-white" /> : <Download size={18} className="text-purple-700" />}
                        </div>
                        <div>
                            <p className="text-sm font-bold">{isInstalling ? 'Installing...' : 'Install EduHub'}</p>
                            <p className="text-[10px] text-purple-100">Save data & apply offline.</p>
                        </div>
                    </div>
                    <div className="flex items-center">
                        {!isInstalling && (
                            <button 
                                onClick={handleInstallApp}
                                className="bg-white text-purple-600 text-xs font-bold px-4 py-2 rounded-full mr-2 hover:bg-purple-50 transition"
                            >
                                Get
                            </button>
                        )}
                        <button onClick={() => setShowInstallBanner(false)}>
                            <X size={18} className="text-purple-200" />
                        </button>
                    </div>
                </div>
            )}

            <MobileTopBar 
                currentView={currentView} 
                onNavigate={navigateTo} 
                currentUser={currentUser}
                onLogout={handleLogout}
                applicationCount={selectedInstitutions.length}
            />

            <div className="flex-1 overflow-y-auto bg-gray-50 scrollbar-hide pb-20">
                {currentView === 'landing' && <Hero />}

                {(currentView === 'login' || currentView === 'register') && (
                    <Auth 
                        view={currentView} 
                        onAuthSuccess={handleLogin} 
                        onNavigate={navigateTo} 
                    />
                )}

                {currentView === 'institutions' && (
                <div className="px-4 py-6 animate-fadeIn pb-8">
                    <div className="flex flex-col gap-4 mb-6">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400" size={20} />
                            <input 
                            type="text" 
                            placeholder="Find universities..." 
                            className="w-full pl-12 pr-4 py-4 bg-white border-2 border-purple-200 rounded-2xl shadow-sm text-gray-700 placeholder-purple-300 text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                            {['All', ...Object.values(InstitutionType)].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setFilterType(type)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold border-2 transition-all ${
                                        filterType === type 
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-600' 
                                        : 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50'
                                    }`}
                                >
                                    {type === 'All' ? 'All' : type.replace('University', 'Univ.')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-4">
                    {filteredInstitutions.length > 0 ? filteredInstitutions.map(inst => (
                        <div key={inst.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-all">
                           <InstitutionCard
                            institution={inst}
                            isSelected={selectedInstitutions.includes(inst.id)}
                            onSelect={toggleInstitutionSelection}
                            />
                        </div>
                    )) : (
                        <div className="text-center py-12 text-purple-400">
                            <p>No matches found.</p>
                        </div>
                    )}
                    </div>
                    {selectedInstitutions.length > 0 && (
                        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-full max-w-[380px] px-4 z-40">
                             <button 
                                onClick={() => navigateTo('apply')}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-full shadow-xl flex items-center justify-between px-8 hover:scale-[1.02] transition-transform"
                            >
                                <span className="font-bold flex items-center">
                                    <span className="bg-yellow-400 text-purple-900 text-xs w-6 h-6 rounded-full flex items-center justify-center mr-3 font-extrabold">
                                        {selectedInstitutions.length}
                                    </span>
                                    Selected
                                </span>
                                <span className="font-bold flex items-center">Apply <ArrowRight size={20} className="ml-2"/></span>
                            </button>
                        </div>
                    )}
                </div>
                )}

                {currentView === 'apply' && (
                <div className="px-4 py-6 animate-fadeIn pb-8">
                    {selectedInstitutions.length === 0 ? (
                    <div className="text-center bg-white p-10 rounded-3xl shadow-sm mt-10 border-2 border-purple-100">
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Info size={32} className="text-purple-600"/>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Basket Empty</h3>
                        <p className="text-sm text-gray-600 mb-8 px-4">Start by selecting institutions you want to apply to.</p>
                        <button 
                        onClick={() => navigateTo('institutions')}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-bold w-full shadow-lg hover:shadow-xl transition-all"
                        >
                        Browse Institutions
                        </button>
                    </div>
                    ) : (
                    <ApplicationForm 
                        selectedInstitutions={selectedInstitutions} 
                        onSubmit={handleApplicationSubmit}
                        currentUser={currentUser}
                    />
                    )}
                </div>
                )}

                {currentView === 'dashboard' && (
                <div className="px-4 py-6 animate-fadeIn pb-8">
                    <div className="mb-6 flex justify-between items-end">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">My Status</h2>
                        <span className="text-xs font-bold text-purple-600 bg-purple-100 px-3 py-1 rounded-lg border border-purple-200">2025 Intake</span>
                    </div>
                    
                    {activeApplication ? (
                    <div className="space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border-2 border-purple-100">
                             <div className="flex items-center mb-6">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold mr-4 text-lg shadow-md">
                                    {activeApplication.firstName[0]}{activeApplication.lastName[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 text-lg">{activeApplication.firstName} {activeApplication.lastName}</p>
                                    <p className="text-xs text-gray-500">{activeApplication.idNumber}</p>
                                </div>
                             </div>

                             <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 flex items-start mb-6 border border-green-200">
                                <Mail className="text-green-600 mr-3 mt-0.5 flex-shrink-0" size={18} />
                                <p className="text-xs text-green-800 leading-relaxed font-medium">
                                    Submitted on {new Date(activeApplication.submittedAt).toLocaleDateString()}. Check your email for reference numbers.
                                </p>
                             </div>
                             
                             <div className="border-t border-purple-100 pt-4 flex justify-between items-center">
                                 <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-sm text-gray-800 mr-2">NSFAS Funding</span>
                                        <span className="text-[10px] bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-bold border border-purple-200">Applied</span>
                                    </div>
                                    <div className="w-32 bg-purple-100 h-2 rounded-full overflow-hidden">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-full h-full rounded-full"></div>
                                    </div>
                                 </div>
                                 <button 
                                    onClick={() => setViewingApplication(activeApplication)}
                                    className="text-purple-600 hover:text-purple-800 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl text-xs font-bold transition flex items-center border border-purple-200"
                                 >
                                    <Eye size={14} className="mr-2" /> View Details
                                 </button>
                             </div>
                        </div>

                        {activeApplication.selectedInstitutions.map((instId, idx) => {
                            const inst = INSTITUTIONS.find(i => i.id === instId);
                            const status = getApplicationStatus(instId);
                            return (
                                <div key={idx} className="bg-white rounded-3xl p-5 shadow-sm relative overflow-hidden flex flex-col border-2 border-purple-100">
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${status.barClass}`}></div>
                                    <div className="flex justify-between items-start mb-4 pl-3">
                                        <div className="flex items-start gap-3">
                                            <div className={`p-3 rounded-2xl ${status.iconBg} flex-shrink-0 border border-purple-200`}>
                                                {status.mainIcon}
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-base leading-tight">{inst?.name}</h3>
                                                <p className="text-xs text-gray-600 font-medium mt-1 line-clamp-1">
                                                   {activeApplication.selectedCourses[instId]}
                                                </p>
                                            </div>
                                        </div>
                                         <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border flex-shrink-0 ml-2 ${status.badgeClass}`}>
                                            {status.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-xs text-gray-700 bg-purple-50 px-3 py-2 rounded-xl ml-3 border border-purple-100">
                                        <div className="flex items-center font-semibold">
                                            {status.icon}
                                            <span>{status.step}</span>
                                        </div>
                                         <span className="text-purple-500 text-[10px] font-bold">{status.timeline}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                    ) : (
                    <div className="text-center py-16">
                        <div className="bg-gradient-to-br from-purple-100 to-pink-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-500 shadow-sm">
                             <FileText size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No applications</h3>
                        <p className="text-gray-500 text-sm mt-2 px-8">Your applications will appear here once submitted.</p>
                        <button 
                        onClick={() => navigateTo('institutions')}
                        className="mt-8 text-purple-600 font-bold text-sm hover:underline"
                        >
                        Start New Application
                        </button>
                    </div>
                    )}
                </div>
                )}
            </div>

            {/* Application Details Modal */}
            {viewingApplication && (
                <ApplicationDetails 
                    application={viewingApplication} 
                    onClose={() => setViewingApplication(null)} 
                />
            )}

            {/* Footer - Moved Outside Scroll Container for Visibility */}
            <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-purple-200 py-3 text-center z-10">
                <p className="text-[10px] text-gray-500 font-medium tracking-wide">
                    EduHub...powered by <span className="font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">MamputlaMokone NPC</span>
                </p>
            </div>

            {showChat && (
                <div className="absolute inset-0 z-50 bg-white flex flex-col animate-slideUp">
                     <div className="flex justify-between items-center p-4 border-b border-purple-100 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                        <h3 className="font-bold flex items-center"><MessageCircle className="mr-2"/> AI Assistant</h3>
                        <button onClick={() => setShowChat(false)} className="p-2 hover:bg-white/10 rounded-full transition">
                           <ArrowRight className="rotate-90" />
                        </button>
                     </div>
                     <div className="flex-1 overflow-hidden relative bg-gray-50">
                        <ChatAssistant 
                            onClose={() => setShowChat(false)} 
                            academicContext={activeApplication}
                        />
                     </div>
                </div>
            )}
            
            {!showChat && currentUser && (
                <button
                    onClick={() => setShowChat(true)}
                    className="absolute bottom-16 right-5 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-full shadow-2xl z-40 active:scale-90 transition-transform"
                >
                    <MessageCircle size={24} />
                </button>
            )}

       </div>
    </div>
  );
}

export default App;
