import React, { useState, useEffect } from 'react';
import { databaseService } from '../services/database';
import { User, ViewState } from '../types';
import { PROVINCES, GENDERS, ETHNICITIES } from '../constants';
import { Loader2, AlertCircle, Eye, EyeOff, CheckCircle, Smartphone, Lock, Mail, RefreshCw } from 'lucide-react';

interface AuthProps {
  view: 'login' | 'register';
  onAuthSuccess: (user: User) => void;
  onNavigate: (view: ViewState) => void;
}

export const Auth: React.FC<AuthProps> = ({ view, onAuthSuccess, onNavigate }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // View State: 'form' | 'otp'
  const [currentStep, setCurrentStep] = useState<'form' | 'otp'>('form');
  const [otpCode, setOtpCode] = useState('');
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);

  // Register Form State
  const [regData, setRegData] = useState({
    firstName: '',
    lastName: '',
    idNumber: '',
    phone: '',
    email: '',
    province: '',
    highSchoolName: '',
    gender: '',
    ethnicity: '',
    password: '',
    confirmPassword: ''
  });

  // Login Form State
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });

  // Timer logic for Resend Button
  useEffect(() => {
    if (resendTimer > 0) {
        const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
        return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (regData.password !== regData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (regData.idNumber.length !== 13) {
      setError("ID Number must be 13 digits");
      return;
    }
    if (!regData.highSchoolName.trim()) {
      setError("High School Name is required");
      return;
    }

    setIsLoading(true);

    try {
      const emailLower = regData.email.toLowerCase();
      await databaseService.registerUser({
        firstName: regData.firstName,
        lastName: regData.lastName,
        idNumber: regData.idNumber,
        email: emailLower,
        phone: regData.phone,
        province: regData.province,
        highSchoolName: regData.highSchoolName,
        gender: regData.gender,
        ethnicity: regData.ethnicity,
        password: regData.password
      });

      // Switch to OTP View
      setPendingEmail(emailLower);
      setCurrentStep('otp');
      setResendTimer(60); // Start 60s cooldown
      
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setIsLoading(true);

      if (!pendingEmail) {
          setError("Session expired. Please register again.");
          setCurrentStep('form');
          setIsLoading(false);
          return;
      }

      try {
          const user = await databaseService.verifyUserOTP(pendingEmail, otpCode);
          onAuthSuccess(user);
      } catch (err: any) {
          setError(err.message || "Invalid Code");
      } finally {
          setIsLoading(false);
      }
  };

  const handleResendOtp = async () => {
      if (resendTimer > 0 || !pendingEmail) return;
      
      setIsLoading(true);
      setError(null);
      try {
          await databaseService.resendUserOTP(pendingEmail);
          setResendTimer(60);
          setSuccessMessage("Code resent to Email & SMS");
          setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err: any) {
          setError("Failed to resend code");
      } finally {
          setIsLoading(false);
      }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
       const emailLower = loginData.email.toLowerCase();
       const user = await databaseService.loginUser(emailLower, loginData.password);
       if (user) {
         onAuthSuccess(user);
       } 
    } catch (err: any) {
       // If backend says account not verified, show OTP screen
       if (err.message && err.message.includes('not verified')) {
           setPendingEmail(loginData.email.toLowerCase());
           setCurrentStep('otp');
           setError(null); 
           setSuccessMessage("Please complete verification.");
       } else {
           setError(err.message || "Login failed.");
       }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (view === 'register') {
      setRegData({ ...regData, [e.target.name]: e.target.value });
    } else {
      setLoginData({ ...loginData, [e.target.name]: e.target.value });
    }
    if (error) setError(null);
  };

  const inputClass = "appearance-none rounded-xl relative block w-full px-4 py-4 bg-stone-100 border-none placeholder-stone-400 text-stone-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm font-medium";
  const labelClass = "block text-xs font-bold text-stone-400 uppercase mb-1.5 ml-1";

  // --- OTP Verification Screen ---
  if (currentStep === 'otp') {
      const isTestMode = pendingEmail?.endsWith('@test.com') || pendingEmail?.endsWith('@example.com');
      return (
          <div className="flex flex-col justify-center items-center py-12 px-6 animate-fadeIn text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mb-6">
                  <Smartphone size={40} className="text-orange-600" />
              </div>
              <h2 className="text-2xl font-extrabold text-stone-900 mb-2">Verify Account</h2>
              <p className="text-stone-500 mb-1 max-w-xs mx-auto text-sm">
                  We've sent a 5-digit code to <br/>
                  <span className="font-bold text-stone-800">{pendingEmail}</span>
              </p>
              {isTestMode ? (
                  <p className="text-green-600 text-xs mb-6 font-bold bg-green-50 px-2 py-1 rounded">Test Mode: Use code 12345</p>
              ) : (
                  <p className="text-stone-400 text-xs mb-6">(Please check Spam/Junk folder)</p>
              )}

              {successMessage && (
                  <div className="mb-4 text-green-600 text-sm font-bold flex items-center bg-green-50 px-3 py-2 rounded-lg">
                      <CheckCircle size={16} className="mr-2"/> {successMessage}
                  </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-100 p-3 rounded-xl mb-4 w-full max-w-xs">
                    <p className="text-sm text-red-700 font-bold">{error}</p>
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="w-full max-w-xs">
                  <div className="mb-6">
                      <label className="sr-only">OTP Code</label>
                      <input
                          type="text"
                          maxLength={5}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                          className="w-full text-center text-3xl font-bold tracking-[0.5em] py-4 rounded-xl border-2 border-stone-200 focus:border-orange-500 focus:outline-none bg-white text-stone-800"
                          placeholder="•••••"
                      />
                  </div>
                  <button 
                      type="submit"
                      disabled={isLoading || otpCode.length < 5}
                      className="w-full py-4 bg-stone-900 text-white rounded-full font-bold shadow-lg hover:bg-black transition disabled:opacity-50"
                  >
                      {isLoading ? <Loader2 className="animate-spin mx-auto" /> : 'Verify & Login'}
                  </button>
              </form>
              
              <div className="mt-8">
                  <button 
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || isLoading}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 disabled:text-stone-400 flex items-center justify-center mx-auto"
                  >
                      {resendTimer > 0 ? (
                          <>Resend code in {resendTimer}s</>
                      ) : (
                          <><RefreshCw size={14} className="mr-1"/> Resend Code</>
                      )}
                  </button>
              </div>

              <button 
                  onClick={() => setCurrentStep('form')}
                  className="mt-4 text-xs text-stone-400 underline hover:text-stone-600"
              >
                  Entered wrong details? Go back
              </button>
          </div>
      );
  }

  // --- Normal Login/Register Forms ---
  return (
    <div className="flex flex-col justify-center py-8 px-6 animate-fadeIn">
      <div className="w-full space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
            {view === 'login' ? 'Welcome Back' : 'Get Started'}
          </h2>
          <p className="mt-2 text-sm text-stone-500 font-medium">
            {view === 'login' ? 'Sign in to your account' : 'Create your student profile'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-start">
            <AlertCircle className="text-red-500 mr-3 mt-0.5" size={18} />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </div>
        )}

        {successMessage && (
           <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex items-start">
            <CheckCircle className="text-green-500 mr-3 mt-0.5" size={18} />
            <p className="text-sm text-green-700 font-medium">{successMessage}</p>
          </div>
        )}

        {view === 'login' ? (
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Email Address</label>
                <input
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                  placeholder="name@example.com"
                  value={loginData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="relative">
                <label className={labelClass}>Password</label>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className={inputClass}
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-10 text-stone-400 hover:text-stone-600"
                >
                  {showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}
                </button>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-stone-900 hover:bg-black focus:outline-none transition disabled:opacity-70 shadow-lg active:scale-95"
              >
                {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : <span className="flex items-center"><Lock size={16} className="mr-2"/> Sign in</span>}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <p className="text-sm text-stone-500">
                New to EduHub?{' '}
                <button onClick={() => onNavigate('register')} className="font-bold text-orange-600 hover:text-orange-700">
                  Create Account
                </button>
              </p>
            </div>
          </form>
        ) : (
          <form className="mt-4 space-y-5" onSubmit={handleRegister}>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className={labelClass}>First Name</label>
                  <input
                    name="firstName"
                    type="text"
                    required
                    className={inputClass}
                    value={regData.firstName}
                    onChange={handleChange}
                  />
               </div>
               <div>
                  <label className={labelClass}>Last Name</label>
                  <input
                    name="lastName"
                    type="text"
                    required
                    className={inputClass}
                    value={regData.lastName}
                    onChange={handleChange}
                  />
               </div>
            </div>

            <div>
               <label className={labelClass}>SA ID Number</label>
               <input
                 name="idNumber"
                 type="text"
                 maxLength={13}
                 required
                 className={inputClass}
                 placeholder="13 digits"
                 value={regData.idNumber}
                 onChange={handleChange}
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className={labelClass}>Gender</label>
                  <select
                    name="gender"
                    required
                    className={inputClass}
                    value={regData.gender}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
               </div>
               <div>
                  <label className={labelClass}>Ethnicity</label>
                  <select
                    name="ethnicity"
                    required
                    className={inputClass}
                    value={regData.ethnicity}
                    onChange={handleChange}
                  >
                    <option value="">Select</option>
                    {ETHNICITIES.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
               </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className={labelClass}>Phone</label>
                 <input
                   name="phone"
                   type="tel"
                   required
                   className={inputClass}
                   placeholder="072..."
                   value={regData.phone}
                   onChange={handleChange}
                 />
              </div>
              <div>
                 <label className={labelClass}>Province</label>
                 <select
                   name="province"
                   required
                   className={inputClass}
                   value={regData.province}
                   onChange={handleChange}
                 >
                   <option value="">Select</option>
                   {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                 </select>
              </div>
            </div>

            <div>
               <label className={labelClass}>High School</label>
               <input
                 name="highSchoolName"
                 type="text"
                 required
                 className={inputClass}
                 placeholder="School Name"
                 value={regData.highSchoolName}
                 onChange={handleChange}
               />
            </div>

            <div>
               <label className={labelClass}>Email</label>
               <input
                 name="email"
                 type="email"
                 required
                 className={inputClass}
                 value={regData.email}
                 onChange={handleChange}
               />
            </div>

            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className={labelClass}>Password</label>
                  <input
                    name="password"
                    type="password"
                    required
                    className={inputClass}
                    value={regData.password}
                    onChange={handleChange}
                  />
               </div>
               <div>
                  <label className={labelClass}>Confirm</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    required
                    className={inputClass}
                    value={regData.confirmPassword}
                    onChange={handleChange}
                  />
               </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold rounded-full text-white bg-stone-900 hover:bg-black focus:outline-none transition shadow-lg active:scale-95"
              >
                 {isLoading ? <Loader2 className="animate-spin mr-2" size={20} /> : 'Create Account'}
              </button>
            </div>

            <div className="text-center mt-4 pb-8">
              <p className="text-sm text-stone-500">
                Have an account?{' '}
                <button onClick={() => onNavigate('login')} className="font-bold text-orange-600 hover:text-orange-700">
                  Login
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};