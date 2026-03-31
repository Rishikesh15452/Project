"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Package, Truck, CheckCircle2, Send, LogOut, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const STEPS = [
  { key: "reported", label: "Reported" },
  { key: "forwarded", label: "Forwarded" },
  { key: "in_progress", label: "In Progress" },
  { key: "resolved", label: "Resolved" },
];

function getStepIndex(status: string, department?: string | null): number {
  if (status === "Resolved") return 3;
  if (status === "In Progress") return 2;
  if (department) return 1;
  return 0;
}

function getStatusMessage(step: number, department?: string | null): string {
  if (step === 3) return "Issue has been resolved ✓";
  if (step === 2) return "Work is being carried out";
  if (step === 1) return `Forwarded to ${department || "concerned department"}`;
  return "Your report has been registered";
}

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Active");
  const [issues, setIssues] = useState<any[]>([]);
  const [userName, setUserName] = useState("Citizen");
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchIssues = async (uid: string) => {
    const { data } = await supabase
      .from("issues").select("*").eq("user_id", uid).order("created_at", { ascending: false });
    if (data) {
      setIssues(data.map((d: any) => ({
        id: d.id, title: d.title, category: d.category, status: d.status,
        department: d.department, area: d.area, upvotes: d.upvotes || 0,
        time: new Date(d.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
        image: d.image_urls?.[0] || null,
      })));
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { router.replace("/login"); return; }
      const uid = session.user.id;
      setUserId(uid);
      const { data: profile } = await supabase.from('profiles').select('name').eq('id', uid).single();
      if (profile?.name) setUserName(profile.name);
      else if (session.user.user_metadata?.full_name) setUserName(session.user.user_metadata.full_name.split(' ')[0]);
      await fetchIssues(uid);
    };
    init();
  }, [router]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel('citizen-issues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues', filter: `user_id=eq.${userId}` }, () => {
        fetchIssues(userId);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  const displayedIssues = issues.filter(issue => 
    activeTab === "Resolved" ? issue.status === "Resolved" : issue.status !== "Resolved"
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100 dark:border-[#1a1a1a]">
        <div className="max-w-2xl mx-auto px-4 pt-5 pb-3">
          <div className="flex items-center justify-between mb-3">
            <Link href="/" className="p-2 rounded-full bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-500 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <Link href="/report">
                <button className="fluid-gradient-bg text-white px-4 py-2 rounded-full font-bold text-xs shadow-md">+ Report</button>
              </Link>
              <button onClick={async () => { await supabase.auth.signOut(); router.replace("/login"); }}
                className="p-2 rounded-full bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-400 hover:text-red-500 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight">Hi, <span className="fluid-gradient-text">{userName}</span></h1>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">{issues.length} total reports</p>
        </div>
        <div className="max-w-2xl mx-auto px-4 flex items-center gap-3 pb-3">
          {["Active", "Resolved"].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${activeTab === tab ? "bg-foreground text-background" : "bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-500"}`}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 w-full max-w-2xl mx-auto p-4 pb-24">
        <div className="flex flex-col gap-5">
          {isLoading ? (
            <div className="text-center text-zinc-400 font-bold py-16 animate-pulse text-sm">Loading...</div>
          ) : displayedIssues.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Package className="w-10 h-10 text-zinc-300" />
              <p className="text-zinc-400 text-sm font-bold">No {activeTab.toLowerCase()} reports</p>
              <Link href="/report" className="fluid-gradient-bg text-white font-bold px-5 py-2.5 rounded-full text-xs shadow-md">Report an Issue</Link>
            </div>
          ) : (
            displayedIssues.map((issue) => {
              const currentStep = getStepIndex(issue.status, issue.department);
              const statusMsg = getStatusMessage(currentStep, issue.department);
              
              return (
                <motion.div key={issue.id} layout
                  className="bg-white dark:bg-[#121212] rounded-2xl overflow-hidden border border-zinc-100 dark:border-[#1a1a1a]">
                  
                  {/* Issue Info */}
                  <div className="p-4 pb-2">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0 mr-3">
                        <h3 className="font-bold text-sm text-foreground line-clamp-1">{issue.title}</h3>
                        <p className="text-[11px] text-zinc-400 mt-0.5">{issue.area || "Local Area"} • {issue.time}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">#{issue.category?.replace(/\s+/g, '')}</span>
                    </div>
                  </div>

                  {/* Issue Image */}
                  {issue.image && (
                    <div className="w-full aspect-video bg-zinc-100 dark:bg-[#0a0a0a] overflow-hidden">
                      <img src={issue.image} alt={issue.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* ========== AMAZON-STYLE HORIZONTAL PROGRESS BAR ========== */}
                  <div className="p-4 pt-3">
                    {/* Status Message */}
                    <div className="flex items-center justify-between mb-3">
                      <p className={`text-sm font-bold ${currentStep === 3 ? 'text-green-500' : currentStep >= 1 ? 'text-pink-500' : 'text-foreground'}`}>
                        {statusMsg}
                      </p>
                      {currentStep < 3 && (
                        <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.5, repeat: Infinity }}
                          className="w-2 h-2 rounded-full bg-pink-500" />
                      )}
                    </div>

                    {/* Horizontal Bar */}
                    <div className="relative">
                      {/* Track Background */}
                      <div className="h-2 bg-zinc-200 dark:bg-[#262626] rounded-full w-full" />
                      
                      {/* Active Fill */}
                      <motion.div
                        className="absolute top-0 left-0 h-2 rounded-full"
                        style={{ background: currentStep === 3 ? '#22c55e' : 'linear-gradient(90deg, #ff0080, #8b5cf6)' }}
                        initial={{ width: '0%' }}
                        animate={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                      />

                      {/* Step Dots */}
                      <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between">
                        {STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentStep;
                          const isCurrent = idx === currentStep;
                          return (
                            <div key={step.key} className="relative flex flex-col items-center" style={{ width: 0 }}>
                              {isCurrent && currentStep < 3 ? (
                                <div className="relative">
                                  <motion.div
                                    animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 w-5 h-5 rounded-full -translate-x-1/2"
                                    style={{ background: 'linear-gradient(135deg, #ff0080, #8b5cf6)', left: '50%', top: '-2px' }}
                                  />
                                  <div className="w-5 h-5 rounded-full border-[3px] border-white dark:border-[#121212] relative z-10 shadow-md -translate-x-1/2"
                                    style={{ background: 'linear-gradient(135deg, #ff0080, #8b5cf6)', left: '50%' }} />
                                </div>
                              ) : (
                                <div className={`w-4 h-4 rounded-full border-[3px] border-white dark:border-[#121212] -translate-x-1/2 ${
                                  isCompleted 
                                    ? (currentStep === 3 ? 'bg-green-500' : 'bg-gradient-to-r from-pink-500 to-purple-500') 
                                    : 'bg-zinc-300 dark:bg-[#333]'
                                }`} style={isCompleted && currentStep < 3 ? { background: 'linear-gradient(135deg, #ff0080, #8b5cf6)' } : {}} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Step Labels */}
                    <div className="flex justify-between mt-3">
                      {STEPS.map((step, idx) => {
                        const isCompleted = idx <= currentStep;
                        return (
                          <div key={step.key} className="flex flex-col items-center text-center" style={{ width: `${100 / STEPS.length}%` }}>
                            <span className={`text-[10px] font-bold leading-tight ${isCompleted ? 'text-foreground' : 'text-zinc-400'}`}>
                              {step.label}
                            </span>
                            {idx === 1 && issue.department && (
                              <span className="text-[9px] text-pink-500 font-medium mt-0.5 line-clamp-1">{issue.department}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}
