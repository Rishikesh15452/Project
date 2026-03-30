"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, ListChecks, Activity } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthAndFetch = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          router.replace("/login");
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (profile?.role !== "admin") {
          router.replace("/dashboard");
          return;
        }

        setIsAdmin(true);
        await fetchIssues();
      } catch (err) {
        console.error("Admin check failed", err);
        router.replace("/dashboard");
      }
    };

    checkAuthAndFetch();
  }, [router]);

  const fetchIssues = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (data) setIssues(data);
    setIsLoading(false);
  };

  const handleUpdateIssue = async (id: string, updates: Partial<any>) => {
    try {
      const { error } = await supabase
        .from("issues")
        .update(updates)
        .eq("id", id);
      
      if (!error) {
        await fetchIssues();
      }
    } catch (err) {
      console.error("Failed to update issue", err);
    }
  };

  if (!isAdmin) return null;

  const stats = {
    total: issues.length,
    open: issues.filter((i) => i.status === "Open").length,
    inProgress: issues.filter((i) => i.status === "In Progress").length,
    resolved: issues.filter((i) => i.status === "Resolved").length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#070707] flex flex-col items-center relative overflow-hidden">
      
      {/* Background Deep Blur */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full fluid-gradient-bg blur-[150px] opacity-[0.15] mix-blend-screen pointer-events-none" />

      {/* Floating Header */}
      <header className="fixed top-6 z-50 w-[95%] max-w-7xl glass-panel rounded-full px-8 py-4 flex items-center justify-between border-white/20 dark:border-white/10">
        <div className="flex items-center gap-6">
          <Link href="/" className="inline-flex items-center justify-center p-2 rounded-full bg-zinc-200/50 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </Link>
          <div className="flex flex-col">
            <h1 className="text-xl font-black tracking-tighter">Loksetu <span className="fluid-gradient-text">Admin HQ</span></h1>
          </div>
        </div>
        <button 
          onClick={async () => {
            await supabase.auth.signOut();
            router.replace("/login");
          }}
          className="text-sm font-bold bg-white dark:bg-zinc-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950 px-5 py-2.5 rounded-full transition-all shadow-md active:scale-95"
        >
          Sign Out
        </button>
      </header>

      <main className="flex-1 w-full max-w-7xl px-4 pt-32 pb-24 relative z-10 space-y-12">
        
        {/* Analytics Widgets (Apple Vision Pro style widgets) */}
        <section>
          <div className="flex items-center justify-between mb-8 px-2">
            <h2 className="text-3xl font-black tracking-tight">System Status</h2>
            <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              Monitoring {stats.total} Active Nodes
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 rounded-[2.5rem] flex flex-col justify-between aspect-square md:aspect-auto h-48">
              <span className="fluid-gradient-bg w-10 h-10 rounded-full flex items-center justify-center shadow-lg"><Activity className="w-5 h-5 text-white"/></span>
              <div>
                <span className="text-5xl font-black block tracking-tighter">{stats.total}</span>
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1 block">Total Reports</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 rounded-[2.5rem] flex flex-col justify-between aspect-square md:aspect-auto h-48">
              <span className="bg-red-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-red-500/30"><AlertTriangle className="w-5 h-5 text-white"/></span>
              <div>
                <span className="text-5xl font-black block tracking-tighter text-red-500">{stats.open}</span>
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1 block">Requires Action</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 rounded-[2.5rem] flex flex-col justify-between aspect-square md:aspect-auto h-48">
              <span className="bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-orange-500/30"><Clock className="w-5 h-5 text-white"/></span>
              <div>
                <span className="text-5xl font-black block tracking-tighter text-orange-500">{stats.inProgress}</span>
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1 block">In Progress</span>
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-panel p-8 rounded-[2.5rem] flex flex-col justify-between aspect-square md:aspect-auto h-48">
              <span className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center shadow-lg shadow-green-500/30"><CheckCircle2 className="w-5 h-5 text-white"/></span>
              <div>
                <span className="text-5xl font-black block tracking-tighter text-green-500">{stats.resolved}</span>
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1 block">Resolved</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Action Center - Borderless Row Layout */}
        <section>
          <div className="flex justify-between items-center mb-8 px-2">
            <h2 className="text-3xl font-black tracking-tight">Active Dispatches</h2>
            <button onClick={fetchIssues} className="text-sm font-bold fluid-gradient-bg text-transparent bg-clip-text hover:opacity-70 transition-opacity">
              Live Refresh
            </button>
          </div>

          <div className="glass-panel rounded-[3rem] p-6 lg:p-10">
            {isLoading ? (
              <div className="py-20 text-center font-bold text-zinc-500 animate-pulse text-lg">Loading localized reports...</div>
            ) : issues.length === 0 ? (
              <div className="py-20 text-center font-bold text-zinc-500 text-lg">No infrastructure reports active.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {issues.map((issue) => (
                  <div key={issue.id} className="flex flex-col lg:flex-row items-start lg:items-center justify-between p-6 rounded-[2rem] bg-white/50 dark:bg-black/50 hover:bg-white dark:hover:bg-zinc-900 transition-colors border border-white/20 dark:border-white/5 gap-6">
                    
                    {/* Report Information */}
                    <div className="flex items-center gap-6 flex-1 min-w-[300px]">
                      <div className="w-14 h-14 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex-shrink-0 overflow-hidden shadow-sm">
                        {issue.image_urls?.[0] ? (
                          <img src={issue.image_urls[0]} alt="thumbnail" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-zinc-400" /></div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-foreground tracking-tight leading-tight mb-1 line-clamp-1">{issue.title}</h3>
                        <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">{issue.category} • {issue.area || "Zone Unknown"}</p>
                      </div>
                    </div>

                    {/* Controls */}
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Department Control */}
                      <div className="bg-zinc-100 dark:bg-black rounded-xl px-4 py-2 border border-zinc-200/50 dark:border-zinc-800 flex items-center">
                        <select 
                          className="bg-transparent font-bold text-sm text-foreground outline-none cursor-pointer w-[160px]"
                          value={issue.department || ""}
                          onChange={(e) => handleUpdateIssue(issue.id, { department: e.target.value })}
                        >
                          <option value="">Awaiting Dispatch</option>
                          <option value="Waste Management">Waste Division</option>
                          <option value="Roads & Highways">Transport & Roads</option>
                          <option value="Water & Sewage">Water Infrastructure</option>
                          <option value="Electricity">Power Grid</option>
                          <option value="Police / Law">Civil Defense</option>
                        </select>
                      </div>

                      {/* Status Control */}
                      <div className={`rounded-xl px-4 py-2 border flex items-center font-bold ${
                        issue.status === 'Open' ? 'bg-red-500/10 text-red-600 border-red-500/20 dark:text-red-400' :
                        issue.status === 'In Progress' ? 'bg-orange-500/10 text-orange-600 border-orange-500/20 dark:text-orange-400' :
                        'bg-green-500/10 text-green-600 border-green-500/20 dark:text-green-400'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          issue.status === 'Open' ? 'bg-red-500' :
                          issue.status === 'In Progress' ? 'bg-orange-500' :
                          'bg-green-500'
                        }`} />
                        <select 
                          className="bg-transparent tracking-tight outline-none cursor-pointer text-sm w-[110px]"
                          value={issue.status}
                          onChange={(e) => handleUpdateIssue(issue.id, { status: e.target.value })}
                        >
                          <option value="Open">Unresolved</option>
                          <option value="In Progress">Dispatched</option>
                          <option value="Resolved">Cleared</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
