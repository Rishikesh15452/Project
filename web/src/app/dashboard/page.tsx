"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Filter, ThumbsUp, MapPin, AlertTriangle, ArrowLeft, MoreHorizontal, MessageCircle } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("My Reports");
  const [issues, setIssues] = useState<any[]>([]);
  const [userName, setUserName] = useState("Citizen");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndIssues = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      let userId = null;
      if (session?.user) {
        userId = session.user.id;
        const { data: profile } = await supabase.from('profiles').select('name').eq('id', userId).single();
        
        if (profile?.name) {
          setUserName(profile.name);
        } else if (session.user.user_metadata?.full_name) {
          setUserName(session.user.user_metadata.full_name.split(' ')[0]);
        }
      }

      let query = supabase.from("issues").select("*").order("created_at", { ascending: false });
      
      if (userId) {
         query = query.eq("user_id", userId);
      }

      const { data, error } = await query;

      if (data) {
        setIssues(data.map((dbIssue: any) => ({
          id: dbIssue.id,
          title: dbIssue.title,
          category: dbIssue.category,
          status: dbIssue.status,
          upvotes: dbIssue.upvotes || 0,
          distance: "Local Area",
          time: new Date(dbIssue.created_at).toLocaleDateString(),
          image: dbIssue.image_urls?.[0] || "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400&h=300",
        })));
      }
      setIsLoading(false);
    };
    
    fetchUserAndIssues();
  }, []);

  const displayedIssues = issues.filter(issue => 
    activeTab === "Resolved" ? issue.status === "Resolved" : issue.status !== "Resolved"
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#050505] flex flex-col">
      {/* Heavy Header & Glassmorphism */}
      <header className="glass-panel sticky top-0 z-40 w-full border-b-0 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 pt-6 pb-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-foreground transition-colors font-medium bg-zinc-100 dark:bg-zinc-900 p-2.5 rounded-full">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>
          <h1 className="text-3xl tracking-tight font-black mb-4">Welcome back, <span className="fluid-gradient-text">{userName}</span>!</h1>
          
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex-1 mr-4 relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                placeholder="Search Loksetu..." 
                className="w-full bg-zinc-100 dark:bg-zinc-900 border-none rounded-full py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-pink-500 transition-all font-medium text-sm"
              />
            </div>
            <button className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-full transition-colors active:scale-95">
              <Filter className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>
        
        {/* Pills Tabs */}
        <div className="max-w-4xl mx-auto px-4 flex items-center gap-4 overflow-x-auto hide-scrollbar pb-4 pt-2">
          {["My Reports", "Resolved"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? "fluid-gradient-bg text-white shadow-xl shadow-pink-500/20" 
                  : "bg-zinc-100 dark:bg-zinc-900 text-zinc-500 hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-xl mx-auto p-4 relative py-6">
        
        <motion.div 
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-10 pb-24"
        >
          {isLoading ? (
            <div className="text-center text-zinc-500 font-bold py-10 animate-pulse">Loading Identity...</div>
          ) : displayedIssues.length === 0 ? (
            <div className="text-center text-zinc-500 font-bold py-10">You have no {activeTab === "Resolved" ? "resolved" : "active"} reports.</div>
          ) : (
            displayedIssues.map((issue) => (
              <div 
                key={issue.id} 
                className="bg-white dark:bg-[#111] rounded-[2.5rem] overflow-hidden shadow-2xl shadow-zinc-200/50 dark:shadow-none transition-all group border border-zinc-100 dark:border-white/5"
              >
                {/* Card Header Profile Style */}
                <div className="flex items-center justify-between p-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full fluid-gradient-bg p-[2px]">
                      <div className="w-full h-full bg-white dark:bg-black rounded-full flex items-center justify-center text-xs font-bold text-transparent bg-clip-text" style={{backgroundImage: 'linear-gradient(135deg, #ff0080, #8b5cf6)'}}>
                        {userName.substring(0,2).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-sm tracking-tight leading-none text-foreground">{userName}</h4>
                      <span className="text-xs text-zinc-500 font-medium">{issue.distance} • {issue.time}</span>
                    </div>
                  </div>
                  <button className="text-zinc-400 hover:text-foreground transition-colors p-2">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Edge-to-Edge Media */}
                <div className="relative w-full aspect-[4/5] bg-zinc-100 dark:bg-zinc-900 overflow-hidden">
                    <img src={issue.image} alt={issue.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" />
                    
                    {/* Glass Status Badge */}
                    <div className="absolute top-4 right-4 glass-panel rounded-full px-4 py-1.5 flex items-center font-bold text-xs">
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        issue.status === 'Open' ? 'bg-red-500' : 
                        issue.status === 'In Progress' ? 'bg-orange-500' : 'bg-green-500'
                      }`} />
                      <span className="text-foreground">{issue.status}</span>
                    </div>
                </div>
                
                {/* Engagement & Caption */}
                <div className="p-5">
                  <div className="flex items-center gap-4 mb-3">
                    <button className="text-foreground hover:opacity-70 transition-opacity active:scale-95">
                      <ThumbsUp className="w-6 h-6" />
                    </button>
                    <button className="text-foreground hover:opacity-70 transition-opacity active:scale-95">
                      <MessageCircle className="w-6 h-6" />
                    </button>
                  </div>
                  
                  <p className="font-bold text-sm mb-1">{issue.upvotes.toLocaleString()} upvotes</p>
                  <p className="text-sm font-medium leading-relaxed">
                    <span className="font-bold mr-2">{userName}</span> 
                    {issue.title}
                  </p>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-3">
                    #{issue.category.replace(/\s+/g, '')}
                  </p>

                  {/* Visual Progress Timeline */}
                  <div className="mt-6 pt-5 border-t border-zinc-100 dark:border-zinc-800/50">
                    <h5 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Track Progress</h5>
                    <div className="relative flex justify-between items-center px-2">
                      {/* Background Track */}
                      <div className="absolute top-2 left-4 right-4 h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                      
                      {/* Active Track Overlay */}
                      <div 
                        className="absolute top-2 left-4 h-1 fluid-gradient-bg rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `calc(${issue.status === 'Open' ? 0 : issue.status === 'In Progress' ? 50 : 100}% - 2rem)` }} 
                      />

                      {["Open", "In Progress", "Resolved"].map((step, idx) => {
                        const currentIdx = issue.status === "Open" ? 0 : issue.status === "In Progress" ? 1 : 2;
                        const isActive = idx <= currentIdx;
                        return (
                          <div key={step} className="z-10 flex flex-col items-center gap-2">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isActive ? 'fluid-gradient-bg shadow-md' : 'bg-zinc-200 dark:bg-zinc-800'}`}>
                               <div className="w-2 h-2 bg-white dark:bg-black rounded-full" />
                            </div>
                            <span className={`text-[10px] font-bold uppercase tracking-widest ${isActive ? 'text-foreground' : 'text-zinc-400'}`}>{step}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </motion.div>
      </main>

      {/* Floating Action Button for Mobile */}
      <Link href="/report">
        <button className="fixed bottom-8 right-8 w-16 h-16 fluid-gradient-bg rounded-[1.25rem] rotate-3 shadow-2xl flex items-center justify-center text-white hover:rotate-0 hover:scale-110 active:scale-95 transition-all z-50">
           <AlertTriangle className="w-6 h-6" />
        </button>
      </Link>
    </div>
  );
}
