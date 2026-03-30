"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Lock, Mail, ArrowLeft, Phone, UserCircle2, ShieldAlert, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<"citizen" | "admin">("citizen");
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState("+91"); 
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("/dashboard");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && !isSuccess) {
        await handlePostLoginRedirect(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [isSuccess]);

  const handlePostLoginRedirect = async (userId: string | undefined) => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();
      
      if (data && data.role === 'admin') {
        setRedirectUrl('/admin');
      } else {
        setRedirectUrl('/dashboard');
      }
      setIsSuccess(true);
    } catch (e) {
      setIsSuccess(true);
    }
  }

  // Authenticate using Email / Password (Admin Only)
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError("");

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        
        // Explicitly set the custom role for this signup
        if (data.user?.id) {
          await supabase.from('profiles').insert({
            id: data.user.id,
            role: activeRole,
          });
        }
        await handlePostLoginRedirect(data.user?.id);
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await handlePostLoginRedirect(data.user?.id);
      }
    } catch (err: any) {
      setIsError(err.message || "Failed to authenticate. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Authenticate using Phone / OTP (Admin Only)
  const handlePhoneAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsError("");

    try {
      if (!otpSent) {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
        setOtpSent(true);
      } else {
        const { data, error } = await supabase.auth.verifyOtp({ phone, token: otp, type: 'sms' });
        if (error) throw error;
        
        // Apply role logic if signup flow simulated
        if (isSignUp && data.user?.id) {
            // Check if profile exists, if not insert it
            const { data: profile } = await supabase.from('profiles').select('id').eq('id', data.user.id).single();
            if (!profile) {
              await supabase.from('profiles').insert({
                id: data.user.id,
                role: activeRole,
              });
            }
        }
        await handlePostLoginRedirect(data.user?.id);
      }
    } catch (err: any) {
      setIsError(err.message || "Failed to authenticate via SMS.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuth = (provider: 'google' | 'github') => {
    supabase.auth.signInWithOAuth({ provider, options: { redirectTo: window.location.origin + '/login' } });
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-50 dark:bg-zinc-950 p-6">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-24 h-24 fluid-gradient-bg rounded-[2rem] flex items-center justify-center mb-6 shadow-2xl">
          <motion.svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </motion.svg>
        </motion.div>
        
        <h2 className="text-4xl font-black mb-4 tracking-tight">Access <span className="fluid-gradient-text">Granted</span></h2>
        <Link href={redirectUrl} className="bg-foreground text-background px-8 py-4 rounded-[2rem] font-bold transition-transform hover:scale-105 shadow-2xl active:scale-95 text-lg">
          {redirectUrl === "/admin" ? "Open Command Center" : "Enter Public Feed"}
        </Link>
      </div>
    );
  }

  // Dynamic Headings based on state
  const getHeading = () => {
    if (isSignUp) {
      return activeRole === "admin" ? "Registering as Administrator" : "Registering as Responsible Citizen";
    }
    return activeRole === "admin" ? "Administrator Access" : "Hello, Citizen";
  };

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-6 overflow-hidden">
      {/* Background Orbs */}
      <motion.div animate={{ rotate: 360, scale: [1, 1.1, 1] }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -top-32 -left-32 w-[600px] h-[600px] fluid-gradient-bg rounded-full blur-[140px] opacity-20 dark:opacity-30 mix-blend-screen" />
      <motion.div animate={{ rotate: -360, scale: [1, 1.2, 1] }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute -bottom-32 -right-32 w-[600px] h-[600px] fluid-gradient-bg rounded-full blur-[140px] opacity-20 dark:opacity-30 mix-blend-screen" />

      <div className="w-full max-w-md z-10">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-foreground mb-8 transition-colors font-medium hover:-translate-x-1 duration-200">
          <ArrowLeft className="w-4 h-4 mr-2" /> Return Home
        </Link>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-[3rem] p-10 relative overflow-hidden">
          
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 fluid-gradient-bg rounded-[1.5rem] flex items-center justify-center shadow-lg">
              <span className="text-white text-3xl font-black">L</span>
            </div>
          </div>
          
          <h1 className="text-3xl font-black text-center mb-2 tracking-tight">
            {getHeading()}
          </h1>
          <p className="text-zinc-500 text-center mb-8 font-medium">
            {isSignUp ? "Select your profile type to continue." : "Authenticate to access the platform."}
          </p>

          {/* Role Choice Toggle */}
          <div className="flex bg-zinc-200/50 dark:bg-zinc-800/50 backdrop-blur-md rounded-3xl p-1.5 mb-8">
            <button 
              onClick={() => { setActiveRole("citizen"); setIsError(""); setOtpSent(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-[1.5rem] transition-all ${activeRole === 'citizen' ? 'glass-panel shadow-md text-foreground border-white/40' : 'text-zinc-500 hover:text-foreground'}`}
            >
              <UserCircle2 className="w-4 h-4" /> Citizen
            </button>
            <button 
              onClick={() => { setActiveRole("admin"); setIsError(""); setOtpSent(false); }}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-bold rounded-[1.5rem] transition-all ${activeRole === 'admin' ? 'fluid-gradient-bg text-white shadow-md' : 'text-zinc-500 hover:text-foreground'}`}
            >
              <ShieldAlert className="w-4 h-4" /> Official
            </button>
          </div>

          {/* Dynamic Form Content */}
          <AnimatePresence mode="wait">
             <motion.div 
               key={activeRole + isSignUp}
               initial={{ opacity: 0, x: -10 }} 
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 10 }}
               transition={{ duration: 0.2 }}
             >
                {activeRole === "citizen" ? (
                  /* Citizen Flow: Strictly Google Accounts */
                  <div className="flex flex-col gap-4">
                     <button onClick={() => handleOAuth('google')} className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:bg-white hover:shadow-xl dark:hover:bg-zinc-800 transition-all font-bold text-base active:scale-95 group">
                       <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                         <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                         <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                         <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                         <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                       </svg>
                       {isSignUp ? "Sign Up with Google" : "Continue with Google"}
                     </button>
                     <p className="text-xs text-center text-zinc-500 font-medium px-4 mt-2">
                       Citizens rely completely on verified Google accounts for secure identity mapping.
                     </p>
                  </div>
                ) : (
                  /* Admin Flow: Legacy Identity (Email / Phone) */
                  <>
                    <div className="flex bg-zinc-200/30 dark:bg-zinc-900/50 rounded-[1.25rem] p-1 mb-6">
                      <button 
                        onClick={() => { setLoginMethod("email"); setIsError(""); setOtpSent(false); }}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${loginMethod === 'email' ? 'glass-panel text-foreground shadow-sm' : 'text-zinc-500 hover:text-foreground'}`}
                      >
                        Admin Mail
                      </button>
                      <button 
                        onClick={() => { setLoginMethod("phone"); setIsError(""); setOtpSent(false); }}
                        className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${loginMethod === 'phone' ? 'glass-panel text-foreground shadow-sm' : 'text-zinc-500 hover:text-foreground'}`}
                      >
                        Mobile Terminal
                      </button>
                    </div>

                    <form onSubmit={loginMethod === "email" ? handleEmailAuth : handlePhoneAuth} className="space-y-4">
                      {isError && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold text-center">
                          {isError}
                        </motion.div>
                      )}

                      {loginMethod === "email" ? (
                        <>
                          <div className="relative group">
                            <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
                            <input type="email" placeholder="Official Mail" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-pink-500/50 rounded-2xl py-4 pl-14 pr-4 outline-none transition-all text-base font-medium" />
                          </div>
                          <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
                            <input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Terminal Passkey" 
                              required 
                              value={password} 
                              onChange={(e) => setPassword(e.target.value)} 
                              className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-pink-500/50 rounded-2xl py-4 pl-14 pr-12 outline-none transition-all text-base font-medium" 
                            />
                            <button 
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-foreground transition-colors p-1"
                            >
                              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="relative group">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
                            <input type="tel" disabled={otpSent} placeholder="Mobile Array (+91...)" required value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-pink-500/50 rounded-2xl py-4 pl-14 pr-4 outline-none transition-all text-base font-medium disabled:opacity-50" />
                          </div>
                          {otpSent && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="relative group overflow-hidden">
                              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-pink-500 transition-colors w-5 h-5" />
                              <input type="text" placeholder="6-digit Overpass Code" required value={otp} onChange={(e) => setOtp(e.target.value)} className="w-full bg-zinc-100 dark:bg-zinc-900 border border-transparent focus:border-pink-500/50 rounded-2xl py-4 pl-14 pr-4 outline-none transition-all text-base font-medium" />
                            </motion.div>
                          )}
                        </>
                      )}

                      <button type="submit" disabled={isLoading} className="w-full bg-foreground text-background font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-2xl disabled:opacity-70 group mt-6">
                        {isLoading ? (
                          <div className="w-6 h-6 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                        ) : loginMethod === 'phone' ? (
                          <>{otpSent ? "Verify Code" : "Send Connect Request"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                        ) : (
                          <>{isSignUp ? "Generate Credentials" : "Enter Console"} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>
                        )}
                      </button>
                    </form>
                  </>
                )}
             </motion.div>
          </AnimatePresence>

          {/* Toggle Login/Sign Up (For both roles) */}
          <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 text-center">
             <button onClick={() => { setIsSignUp(!isSignUp); setIsError(""); }} className="text-zinc-500 hover:text-foreground font-black transition-colors text-sm underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 hover:decoration-foreground">
               {isSignUp ? "Already hold a credential? Access here." : "Request new platform access"}
             </button>
          </div>

        </motion.div>
        
        <p className="text-center mt-12 text-zinc-300 text-xs font-bold uppercase tracking-widest">
          Loksetu Platform
        </p>

      </div>
    </div>
  );
}
