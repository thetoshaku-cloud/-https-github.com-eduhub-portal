import { ApplicationFormData, ApplicationRecord, User, Course, AdminUser, AuditLog } from '../types';

const SESSION_KEY = 'centralEdu_session';
const SESSION_KEY_ADMIN = 'centralEdu_admin_session';
const DB_KEY_COURSES = 'centralEdu_courses_v1';
const DB_KEY_STATS = 'centralEdu_stats_v1';

export const databaseService = {
  // Initialize DB (Ensure tables exist)
  init: async () => {
    try {
      if (typeof window !== 'undefined') {
          // Trigger the init endpoint to create tables if they don't exist
          fetch('/api/init').catch(e => console.error("DB Init check failed:", e));
      }
    } catch (e) {
      console.warn("Failed to initialize database:", e);
    }
  },

  // --- STATS & ANALYTICS (Keep Local for simplicity/performance in this hybrid model) ---
  incrementDownloads: () => {
      try {
          const stats = JSON.parse(localStorage.getItem(DB_KEY_STATS) || '{"downloads": 1240, "visits": 5400}');
          stats.downloads += 1;
          localStorage.setItem(DB_KEY_STATS, JSON.stringify(stats));
          return stats.downloads;
      } catch (e) { return 0; }
  },

  incrementVisits: () => {
      try {
          const stats = JSON.parse(localStorage.getItem(DB_KEY_STATS) || '{"downloads": 1240, "visits": 5400}');
          stats.visits += 1;
          localStorage.setItem(DB_KEY_STATS, JSON.stringify(stats));
      } catch (e) { }
  },

  getSystemStats: () => {
      const stats = JSON.parse(localStorage.getItem(DB_KEY_STATS) || '{"downloads": 1240, "visits": 5400}');
      return stats;
  },

  // --- ADMIN AUTH MANAGEMENT (Connected to Vercel Postgres) ---
  registerAdmin: async (adminData: { fullName: string; email: string; password?: string }): Promise<AdminUser> => {
     const newAdmin = {
         id: `admin_${Date.now()}`,
         fullName: adminData.fullName,
         email: adminData.email,
         password: adminData.password,
         role: 'super_admin',
         action: 'register'
     };

     const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAdmin)
     });

     if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Admin registration failed');
     }

     const createdAdmin = await res.json();
     localStorage.setItem(SESSION_KEY_ADMIN, JSON.stringify(createdAdmin));
     return createdAdmin;
  },

  loginAdmin: async (email: string, password?: string): Promise<AdminUser | null> => {
      if (!password) throw new Error("Password required");

      const res = await fetch('/api/admins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
      });

      if (res.ok) {
          const admin = await res.json();
          localStorage.setItem(SESSION_KEY_ADMIN, JSON.stringify(admin));
          return admin;
      }
      return null;
  },

  logoutAdmin: () => {
      localStorage.removeItem(SESSION_KEY_ADMIN);
  },

  getCurrentAdmin: (): AdminUser | null => {
      const session = localStorage.getItem(SESSION_KEY_ADMIN);
      return session ? JSON.parse(session) : null;
  },

  // --- USER MANAGEMENT (CONNECTED TO VERCEL POSTGRES) ---

  registerUser: async (userData: Omit<User, 'id' | 'registeredAt'> & { password?: string }): Promise<User> => {
    const newUser = {
      ...userData,
      id: `user_${Date.now()}`,
      registeredAt: new Date().toISOString(),
      action: 'register'
    };

    const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser)
    });

    if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Registration failed');
    }

    const createdUser = await res.json();
    return createdUser;
  },

  verifyUserOTP: async (email: string, code: string): Promise<User> => {
      const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'verify_otp', email, code })
      });

      if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Verification failed');
      }

      const verifiedUser = await res.json();
      databaseService.setSession(verifiedUser); // Auto login
      return verifiedUser;
  },
  
  resendUserOTP: async (email: string): Promise<void> => {
      const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'resend_otp', email })
      });
      
      if (!res.ok) throw new Error("Failed to resend code");
  },

  loginUser: async (email: string, password?: string): Promise<User | null> => {
    // Note: Password is required for the new API-based login
    if (!password) throw new Error("Password required for live database login");

    const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password })
    });

    if (res.ok) {
        const user = await res.json();
        databaseService.setSession(user);
        return user;
    }
    
    // Propagate specific error (e.g., "Account not verified")
    const errorData = await res.json().catch(() => ({}));
    if (errorData.error) {
        throw new Error(errorData.error);
    }
    
    return null;
  },

  logoutUser: () => {
    localStorage.removeItem(SESSION_KEY);
  },

  setSession: (user: User) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  },

  getCurrentUser: (): User | null => {
    const session = localStorage.getItem(SESSION_KEY);
    return session ? JSON.parse(session) : null;
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
        const res = await fetch('/api/users');
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Failed to fetch users", e);
    }
    return [];
  },

  // --- APPLICATION MANAGEMENT (CONNECTED TO VERCEL POSTGRES) ---

  saveApplication: async (data: ApplicationFormData, userId?: string): Promise<ApplicationRecord> => {
    const newRecord: ApplicationRecord = {
      ...data,
      id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: userId,
      submittedAt: new Date().toISOString(),
      status: 'submitted'
    };
    
    const payload = JSON.parse(JSON.stringify(newRecord));
    if (JSON.stringify(payload).length > 4000000) {
        if (payload.profilePicture) payload.profilePicture.dataUrl = null;
        Object.keys(payload.documents).forEach(k => {
            if (payload.documents[k]) payload.documents[k].dataUrl = null;
        });
    }

    const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    if (!res.ok) throw new Error("Failed to save application to server");
    return await res.json();
  },

  getAllApplications: async (): Promise<ApplicationRecord[]> => {
    try {
        const res = await fetch('/api/applications');
        if (res.ok) return await res.json();
    } catch (e) { console.error(e); }
    return [];
  },

  getUserApplications: async (userId: string): Promise<ApplicationRecord[]> => {
    try {
        const res = await fetch(`/api/applications?userId=${userId}`);
        if (res.ok) return await res.json();
    } catch (e) { console.error(e); }
    return [];
  },

  // --- SECURITY / AUDIT LOGS ---
  getAuditLogs: async (): Promise<AuditLog[]> => {
    try {
        const res = await fetch('/api/audit');
        if (res.ok) return await res.json();
    } catch (e) {
        console.error("Failed to fetch audit logs", e);
    }
    return [];
  },

  // --- DYNAMIC COURSE MANAGEMENT (Local/Mock) ---
  saveDynamicCourses: (institutionId: string, courses: Course[]) => {
    const store = databaseService.getAllDynamicCourses();
    const existingForInst = store[institutionId] || [];
    const newCourseNames = new Set(courses.map(c => c.name));
    const merged = [ ...existingForInst.filter(c => !newCourseNames.has(c.name)), ...courses ];
    store[institutionId] = merged;
    localStorage.setItem(DB_KEY_COURSES, JSON.stringify(store));
  },

  getDynamicCourses: (institutionId: string): Course[] => {
    const store = databaseService.getAllDynamicCourses();
    return store[institutionId] || [];
  },

  getAllDynamicCourses: (): Record<string, Course[]> => {
    const data = localStorage.getItem(DB_KEY_COURSES);
    return data ? JSON.parse(data) : {};
  }
};