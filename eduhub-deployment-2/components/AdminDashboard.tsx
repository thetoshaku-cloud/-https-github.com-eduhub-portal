import React, { useEffect, useState } from 'react';
import { databaseService } from '../services/database';
import { User, ApplicationRecord, Institution, AdminUser, AuditLog } from '../types';
import { INSTITUTIONS } from '../constants';
import { Users, FileText, Search, Calendar, Shield, RefreshCw, CheckCircle, Server, CloudLightning, LogOut, Download, TrendingUp, Smartphone, AlertCircle, Loader2, Key, Globe, UserPlus, Clock, Activity, MapPin, Lock } from 'lucide-react';

interface AdminDashboardProps {
    onBack?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBack }) => {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  
  // Dashboard Data State
  const [users, setUsers] = useState<User[]>([]);
  const [applications, setApplications] = useState<ApplicationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState({ downloads: 0, visits: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'integrations' | 'security'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Integration State
  const [syncStatus, setSyncStatus] = useState<Record<string, 'idle' | 'syncing' | 'synced' | 'error'>>({});
  const [lastSyncTime, setLastSyncTime] = useState<Record<string, Date | null>>({});

  // Auth Form State
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authData, setAuthData] = useState({
      email: '',
      password: '',
      fullName: '',
      systemKey: '' // Required for registration
  });

  useEffect(() => {
    // Check for admin session
    const currentAdmin = databaseService.getCurrentAdmin();
    setAdminUser(currentAdmin);

    if (currentAdmin) {
        loadDashboardData();
    }
  }, []);

  const loadDashboardData = async () => {
    setIsRefreshing(true);
    try {
        const [usersData, appsData, logsData] = await Promise.all([
            databaseService.getAllUsers(),
            databaseService.getAllApplications(),
            databaseService.getAuditLogs()
        ]);
        setUsers(usersData);
        setApplications(appsData);
        setAuditLogs(logsData);
        setStats(databaseService.getSystemStats());
    } catch (e) {
        console.error("Failed to load dashboard data", e);
    } finally {
        setIsRefreshing(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.idNumber.includes(searchTerm) ||
    (user.highSchoolName && user.highSchoolName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAuthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setAuthData({...authData, [e.target.name]: e.target.value});
      setAuthError(null);
  };

  const handleLogin = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthLoading(true);
      setAuthError(null);
      
      try {
          const admin = await databaseService.loginAdmin(authData.email, authData.password);
          if (admin) {
              setAdminUser(admin);
              loadDashboardData();
          } else {
              setAuthError('Invalid administrator credentials.');
          }
      } catch (err) {
          setAuthError('An error occurred during login. Please check credentials.');
      } finally {
          setAuthLoading(false);
      }
  };

  const handleRegister = async (e: React.FormEvent) => {
      e.preventDefault();
      setAuthLoading(true);
      setAuthError(null);

      if (authData.systemKey !== 'EDUHUB-ADMIN-2025') {
          setAuthError('Invalid System Key. You are not authorized to create an admin account.');
          setAuthLoading(false);
          return;
      }

      try {
          const newAdmin = await databaseService.registerAdmin({
              email: authData.email,
              fullName: authData.fullName,
              password: authData.password
          });
          setAdminUser(newAdmin);
          loadDashboardData();
      } catch (err: any) {
          setAuthError(err.message || 'Registration failed');
      } finally {
          setAuthLoading(false);
      }
  };

  const handleLogout = () => {
      databaseService.logoutAdmin();
      setAdminUser(null);
      setAuthView('login');
      setAuthData({ email: '', password: '', fullName: '', systemKey: '' });
  };

  const handleSync = async (institution: Institution) => {
    setSyncStatus(prev => ({ ...prev, [institution.id]: 'syncing' }));
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newCourses = [
        { name: `BSc Advanced ${['Robotics', 'Data Science', 'AI', 'Cybersecurity'][Math.floor(Math.random() * 4)]}`, prerequisites: ['Mathematics > 75%'] },
        { name: `Diploma in ${['Digital Marketing', 'Cloud Computing', 'UX Design'][Math.floor(Math.random() * 3)]}`, prerequisites: ['English > 60%'] }
    ];

    try {
        databaseService.saveDynamicCourses(institution.id, newCourses);
        setSyncStatus(prev => ({ ...prev, [institution.id]: 'synced' }));
        setLastSyncTime(prev => ({ ...prev, [institution.id]: new Date() }));
    } catch (e) {
        setSyncStatus(prev => ({ ...prev, [institution.id]: 'error' }));
    }
  };

  if (!adminUser) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
              <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
                  <div className="bg-slate-900 p-8 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 text-amber-500 mb-4">
                          <Shield size={32} />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
                      <p className="text-slate-400 text-sm mt-2">Restricted Access</p>
                  </div>
                  
                  <div className="p-8">
                      {authError && (
                          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-6 flex items-start border border-red-100">
                              <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                              {authError}
                          </div>
                      )}

                      {authView === 'login' ? (
                          <form onSubmit={handleLogin} className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                  <input 
                                    name="email"
                                    type="email" 
                                    required
                                    className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm font-medium"
                                    value={authData.email}
                                    onChange={handleAuthChange}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                  <input 
                                    name="password"
                                    type="password" 
                                    required
                                    className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm font-medium"
                                    value={authData.password}
                                    onChange={handleAuthChange}
                                  />
                              </div>
                              <button 
                                type="submit" 
                                disabled={authLoading}
                                className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition flex justify-center items-center"
                              >
                                {authLoading ? <Loader2 className="animate-spin" /> : 'Login'}
                              </button>
                              <div className="text-center mt-4">
                                  <button type="button" onClick={() => setAuthView('register')} className="text-sm text-slate-500 hover:text-blue-600 font-medium">
                                      Register New Admin
                                  </button>
                              </div>
                          </form>
                      ) : (
                          <form onSubmit={handleRegister} className="space-y-4">
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">System Key (Try: EDUHUB-ADMIN-2025)</label>
                                  <div className="relative">
                                      <Key size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
                                      <input 
                                        name="systemKey"
                                        type="text" 
                                        required
                                        placeholder="Enter key to authorize account creation"
                                        className="w-full p-3 pl-9 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-900 text-sm font-medium"
                                        value={authData.systemKey}
                                        onChange={handleAuthChange}
                                      />
                                  </div>
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Full Name</label>
                                  <input 
                                    name="fullName"
                                    type="text" 
                                    required
                                    className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm font-medium"
                                    value={authData.fullName}
                                    onChange={handleAuthChange}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
                                  <input 
                                    name="email"
                                    type="email" 
                                    required
                                    className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm font-medium"
                                    value={authData.email}
                                    onChange={handleAuthChange}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
                                  <input 
                                    name="password"
                                    type="password" 
                                    required
                                    className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm font-medium"
                                    value={authData.password}
                                    onChange={handleAuthChange}
                                  />
                              </div>
                              <button 
                                type="submit" 
                                disabled={authLoading}
                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-black transition flex justify-center items-center"
                              >
                                {authLoading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                              </button>
                              <div className="text-center mt-4">
                                  <button type="button" onClick={() => setAuthView('login')} className="text-sm text-slate-500 hover:text-blue-600 font-medium">
                                      Back to Login
                                  </button>
                              </div>
                          </form>
                      )}
                  </div>
                  <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                      <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-600 flex items-center justify-center w-full">
                          <LogOut size={14} className="mr-2" /> Back to Application
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  const renderOverview = () => (
    <div className="animate-fadeIn">
      <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Platform Growth</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        
        {/* CARD 1: Total Registrations (Was Downloads) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                    <UserPlus size={24} />
                </div>
                <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp size={12} className="mr-1"/> +{users.length > 0 ? '100' : '0'}%
                </span>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">Total Registrations</p>
                <p className="text-3xl font-bold text-slate-900">{users.length.toLocaleString()}</p>
            </div>
        </div>

        {/* CARD 2: Total Visits (Was Registrations) */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600">
                    <Globe size={24} />
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">Total Visits</p>
                <p className="text-3xl font-bold text-slate-900">{stats.visits.toLocaleString()}</p>
            </div>
        </div>

        {/* CARD 3: Applications */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
                    <FileText size={24} />
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">Applications</p>
                <p className="text-3xl font-bold text-slate-900">{applications.length.toLocaleString()}</p>
            </div>
        </div>

        {/* CARD 4: Application Rate (Was Conversion) */}
         <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-6 rounded-xl border border-slate-700 shadow-sm flex flex-col justify-between text-white">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 rounded-lg bg-white/10 text-emerald-400">
                    <Smartphone size={24} />
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-400">Application Rate</p>
                <p className="text-3xl font-bold text-white">
                    {users.length > 0 ? ((applications.length / users.length) * 100).toFixed(1) : 0}%
                </p>
                <p className="text-xs text-slate-400 mt-1">Apps per User</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-10">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Shield size={18} className="mr-2 text-slate-500"/>
                    User Registry
                </h3>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={16} />
                    <input 
                        type="text" 
                        placeholder="Search users..." 
                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Name</th>
                            <th className="px-6 py-4">High School</th>
                            <th className="px-6 py-4">ID Number</th>
                            <th className="px-6 py-4">Contact</th>
                            <th className="px-6 py-4">Joined</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {user.firstName} {user.lastName}
                                </td>
                                <td className="px-6 py-4 font-medium text-slate-700">
                                    {user.highSchoolName || <span className="text-slate-400 italic">N/A</span>}
                                </td>
                                <td className="px-6 py-4 font-mono text-xs">{user.idNumber}</td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span>{user.email}</span>
                                        <span className="text-xs text-slate-400">{user.phone}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center">
                                        <Calendar size={14} className="mr-2 text-slate-400"/>
                                        {new Date(user.registeredAt).toLocaleDateString()}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                    No users found matching your search.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-10 h-fit">
            <div className="p-6 border-b border-slate-200">
                <h3 className="text-lg font-bold text-slate-800">Recent Applications</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Applicant</th>
                            <th className="px-6 py-4">Institutions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {applications.slice(0, 5).map((app) => (
                            <tr key={app.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 font-medium text-slate-900">
                                    {app.firstName} {app.lastName}
                                    <span className="block text-xs text-slate-400 font-normal">
                                        {new Date(app.submittedAt).toLocaleDateString()}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-100 px-2 py-1 rounded text-xs font-bold text-slate-700">
                                        {app.selectedInstitutions.length}
                                    </span>
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && (
                            <tr>
                                <td colSpan={2} className="px-6 py-8 text-center text-slate-400">
                                    No applications logged.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
      <div className="animate-fadeIn">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-8 text-white mb-8 shadow-lg">
              <div className="flex items-center mb-4">
                  <CloudLightning className="mr-3" size={32} />
                  <h2 className="text-2xl font-bold">University API Integrations</h2>
              </div>
              <p className="opacity-90 max-w-2xl">
                  Connect directly to university databases to pull the latest course lists, prerequisites, and capacity statuses. 
                  Data fetched here will immediately populate the student search interface.
              </p>
          </div>

          <div className="grid grid-cols-1 gap-6">
              {INSTITUTIONS.map(inst => {
                  const status = syncStatus[inst.id] || 'idle';
                  const lastSynced = lastSyncTime[inst.id];
                  
                  return (
                      <div key={inst.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
                          <div className="flex items-center gap-4">
                              <div className="h-12 w-12 bg-slate-100 rounded-lg flex items-center justify-center p-2">
                                  <img src={inst.logoPlaceholder} alt={inst.name} className="w-full h-full object-contain mix-blend-multiply opacity-80" />
                              </div>
                              <div>
                                  <h3 className="font-bold text-slate-800">{inst.name}</h3>
                                  <div className="flex items-center gap-2 text-xs mt-1">
                                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200 font-mono">
                                          API Endpoint: https://api.{inst.id}.ac.za/v1/courses
                                      </span>
                                  </div>
                              </div>
                          </div>
                          
                          <div className="flex items-center gap-6">
                               {lastSynced && (
                                   <div className="text-right hidden md:block">
                                       <p className="text-xs text-slate-400">Last Synced</p>
                                       <p className="text-sm font-medium text-slate-600">{lastSynced.toLocaleTimeString()}</p>
                                   </div>
                               )}
                               
                               <button 
                                  onClick={() => handleSync(inst)}
                                  disabled={status === 'syncing'}
                                  className={`flex items-center px-4 py-2 rounded-lg font-medium transition min-w-[140px] justify-center ${
                                      status === 'synced' ? 'bg-green-100 text-green-700' :
                                      status === 'syncing' ? 'bg-blue-50 text-blue-600' :
                                      'bg-slate-800 text-white hover:bg-slate-900'
                                  }`}
                               >
                                  {status === 'syncing' ? (
                                      <><RefreshCw className="animate-spin mr-2" size={16} /> Syncing...</>
                                  ) : status === 'synced' ? (
                                      <><CheckCircle className="mr-2" size={16} /> Updated</>
                                  ) : (
                                      <><Server className="mr-2" size={16} /> Sync Courses</>
                                  )}
                               </button>
                          </div>
                      </div>
                  )
              })}
          </div>
      </div>
  );

  const renderAuditLogs = () => (
    <div className="animate-fadeIn">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-10">
            <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                    <Lock size={18} className="mr-2 text-slate-500"/>
                    Security & Audit Logs
                </h3>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500">
                        <tr>
                            <th className="px-6 py-4">Time</th>
                            <th className="px-6 py-4">Event</th>
                            <th className="px-6 py-4">User ID</th>
                            <th className="px-6 py-4">IP Address</th>
                            <th className="px-6 py-4">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {auditLogs.map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center text-slate-500">
                                        <Clock size={14} className="mr-2"/>
                                        {new Date(log.created_at).toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        log.event_type.includes('LOGIN') ? 'bg-green-100 text-green-800' :
                                        log.event_type.includes('REGISTER') ? 'bg-blue-100 text-blue-800' :
                                        log.event_type.includes('SUBMIT') ? 'bg-purple-100 text-purple-800' :
                                        'bg-slate-100 text-slate-800'
                                    }`}>
                                        <Activity size={12} className="mr-1.5"/>
                                        {log.event_type}
                                    </span>
                                </td>
                                <td className="px-6 py-4 font-mono text-xs text-slate-500">
                                    {log.user_id}
                                </td>
                                <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                    <div className="flex items-center">
                                        <MapPin size={12} className="mr-1.5 text-slate-400"/>
                                        {log.ip_address}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate">
                                    {JSON.stringify(log.details)}
                                </td>
                            </tr>
                        ))}
                        {auditLogs.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                    <div className="flex flex-col items-center">
                                        <Shield size={40} className="text-slate-200 mb-3" />
                                        <p>No audit logs found.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fadeIn">
      <div className="flex items-center justify-between bg-slate-800 text-white p-4 rounded-xl shadow-lg mb-8">
         <div className="flex items-center">
             <Shield className="mr-3 text-amber-500" size={32} />
             <div>
                 <h1 className="font-bold text-xl leading-none">EduHub Admin</h1>
                 <p className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                     <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                     {adminUser.fullName}
                     <span className="ml-2 px-2 py-0.5 bg-slate-700 rounded text-[10px] text-slate-300 border border-slate-600">Postgres Connected</span>
                 </p>
             </div>
         </div>
         <div className="flex gap-2">
            <button
                onClick={loadDashboardData}
                disabled={isRefreshing}
                className="flex items-center text-slate-300 hover:text-white transition text-sm font-medium bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded-lg disabled:opacity-50"
            >
                <RefreshCw size={16} className={`mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Data
            </button>
            <button 
                onClick={handleLogout}
                className="flex items-center text-slate-300 hover:text-white transition text-sm font-medium bg-red-900/50 hover:bg-red-900 px-4 py-2 rounded-lg"
            >
                <LogOut size={16} className="mr-2"/>
                Sign Out
            </button>
         </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-b border-slate-200 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <span className="bg-slate-800 text-white text-xs font-bold px-2 py-0.5 rounded">SYSTEM DASHBOARD</span>
           </div>
           <h2 className="text-3xl font-bold text-slate-900">System Administration</h2>
        </div>
        
        <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'overview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Analytics & Users
            </button>
            <button 
                onClick={() => setActiveTab('integrations')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'integrations' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                University Integrations
            </button>
            <button 
                onClick={() => setActiveTab('security')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'security' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
            >
                Security & Logs
            </button>
        </div>
      </div>

      {activeTab === 'overview' ? renderOverview() : 
       activeTab === 'integrations' ? renderIntegrations() : renderAuditLogs()}

    </div>
  );
};