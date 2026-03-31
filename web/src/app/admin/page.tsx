"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle2, AlertTriangle, Clock, Activity, X, MapPin, Send, Eye, Building2, Zap, Droplets, Shield, Landmark, Trash2, User, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

const DEPARTMENTS = [
  { value: "Electricity", label: "Electricity", icon: Zap },
  { value: "Municipality", label: "Municipality", icon: Landmark },
  { value: "Water & Sewage", label: "Water & Sewage", icon: Droplets },
  { value: "Roads & Highways", label: "Roads & Highways", icon: MapPin },
  { value: "Waste Management", label: "Waste Management", icon: Trash2 },
  { value: "Police / Law", label: "Police / Law", icon: Shield },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [issues, setIssues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewIssue, setViewIssue] = useState<any | null>(null);
  const [forwardingId, setForwardingId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace("/login"); return; }

      const { data: profile } = await supabase.from("profiles").select("role").eq("id", session.user.id).single();
      if (profile?.role !== "admin") { router.replace("/dashboard"); return; }

      setIsAdmin(true);
      await fetchIssues();
    };
    checkAuth();
  }, [router]);

  // Realtime subscription for live updates
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase
      .channel('admin-issues')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, () => {
        fetchIssues();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin]);

  const fetchIssues = async () => {
    setIsLoading(true);
    const { data } = await supabase.from("issues").select("*").order("created_at", { ascending: false });
    if (data) setIssues(data);
    setIsLoading(false);
  };

  const handleUpdate = async (id: string, updates: Partial<any>) => {
    if (updates.department && updates.department !== "") {
      const issue = issues.find(i => i.id === id);
      if (issue?.status === "Open") updates.status = "In Progress";
    }
    const { error } = await supabase.from("issues").update(updates).eq("id", id);
    if (!error) { await fetchIssues(); setForwardingId(null); }
  };

  const openInMap = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
  };

  if (!isAdmin) return null;

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === "Open").length,
    inProgress: issues.filter(i => i.status === "In Progress").length,
    resolved: issues.filter(i => i.status === "Resolved").length,
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-b border-zinc-100 dark:border-[#1a1a1a]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 rounded-full bg-zinc-100 dark:bg-[#1a1a1a] text-zinc-500 hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h1 className="text-lg font-black tracking-tight">Loksetu <span className="fluid-gradient-text">Admin</span></h1>
          </div>
          <button 
            onClick={async () => { await supabase.auth.signOut(); router.replace("/login"); }}
            className="text-xs font-bold text-red-500 bg-red-500/10 px-4 py-2 rounded-full hover:bg-red-500/20 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        
        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-foreground", icon: Activity, bg: "fluid-gradient-bg" },
            { label: "Open", value: stats.open, color: "text-red-500", icon: AlertTriangle, bg: "bg-red-500" },
            { label: "Progress", value: stats.inProgress, color: "text-orange-500", icon: Clock, bg: "bg-orange-500" },
            { label: "Resolved", value: stats.resolved, color: "text-green-500", icon: CheckCircle2, bg: "bg-green-500" },
          ].map(s => (
            <div key={s.label} className="bg-white dark:bg-[#121212] rounded-2xl p-4 border border-zinc-100 dark:border-[#1a1a1a]">
              <div className={`${s.bg} w-8 h-8 rounded-lg flex items-center justify-center mb-3`}>
                <s.icon className="w-4 h-4 text-white" />
              </div>
              <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Issues List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-black">Citizen Reports</h2>
            <button onClick={fetchIssues} className="text-xs font-bold text-pink-500 hover:opacity-70">Refresh</button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-16 text-center text-zinc-400 font-bold animate-pulse text-sm">Loading...</div>
            ) : issues.length === 0 ? (
              <div className="py-16 text-center text-zinc-400 font-bold text-sm">No reports yet.</div>
            ) : (
              issues.map(issue => (
                <div key={issue.id} className="bg-white dark:bg-[#121212] rounded-2xl border border-zinc-100 dark:border-[#1a1a1a] overflow-hidden">
                  <div className="flex items-center gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-[#0a0a0a] flex-shrink-0 overflow-hidden">
                      {issue.image_urls?.[0] ? (
                        <img src={issue.image_urls[0]} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><AlertTriangle className="w-4 h-4 text-zinc-300" /></div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-foreground line-clamp-1">{issue.title}</h3>
                      <p className="text-[11px] text-zinc-400 font-medium">{issue.category} • {issue.area || "Unknown"}</p>
                      {/* Reporter name */}
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" />
                        {issue.reporter_name || "Anonymous Citizen"}
                      </p>
                      {issue.department && (
                        <p className="text-[10px] font-bold text-pink-500 flex items-center gap-1 mt-0.5">
                          <Send className="w-3 h-3" /> {issue.department}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setViewIssue(issue)} className="p-2 rounded-lg bg-zinc-100 dark:bg-[#0a0a0a] text-zinc-500 hover:text-foreground transition-colors">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setForwardingId(forwardingId === issue.id ? null : issue.id)} className="p-2 rounded-lg fluid-gradient-bg text-white">
                        <Send className="w-4 h-4" />
                      </button>
                      {/* Status select */}
                      <select 
                        className={`text-[11px] font-bold rounded-lg px-2 py-2 outline-none cursor-pointer border ${
                          issue.status === 'Open' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                          issue.status === 'In Progress' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                          'bg-green-500/10 text-green-500 border-green-500/20'
                        }`}
                        value={issue.status}
                        onChange={(e) => handleUpdate(issue.id, { status: e.target.value })}
                      >
                        <option value="Open">Open</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Forwarding Panel */}
                  <AnimatePresence>
                    {forwardingId === issue.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 pt-2 border-t border-zinc-100 dark:border-[#1a1a1a]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-3">Forward to Department</p>
                          <div className="grid grid-cols-3 gap-2">
                            {DEPARTMENTS.map(dept => {
                              const DeptIcon = dept.icon;
                              const sel = issue.department === dept.value;
                              return (
                                <button
                                  key={dept.value}
                                  onClick={() => handleUpdate(issue.id, { department: dept.value })}
                                  className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all border ${
                                    sel ? 'fluid-gradient-bg text-white border-transparent' : 'bg-zinc-50 dark:bg-[#0a0a0a] border-zinc-200 dark:border-[#1a1a1a] text-foreground hover:border-pink-500/50'
                                  }`}
                                >
                                  <DeptIcon className="w-4 h-4 flex-shrink-0" />
                                  {dept.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* ===== VIEW ISSUE MODAL ===== */}
      <AnimatePresence>
        {viewIssue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setViewIssue(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#121212] rounded-2xl w-full max-w-md max-h-[85vh] overflow-y-auto border border-zinc-200 dark:border-[#262626]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-md z-10 flex items-center justify-between p-4 border-b border-zinc-100 dark:border-[#1a1a1a]">
                <h2 className="text-base font-black">Issue Details</h2>
                <button onClick={() => setViewIssue(null)} className="p-1.5 rounded-full bg-zinc-100 dark:bg-[#1a1a1a] hover:bg-zinc-200 dark:hover:bg-[#262626]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Image */}
              {viewIssue.image_urls?.[0] && (
                <div className="w-full aspect-video bg-zinc-100 dark:bg-[#0a0a0a] overflow-hidden">
                  <img src={viewIssue.image_urls[0]} alt={viewIssue.title} className="w-full h-full object-cover" />
                </div>
              )}

              <div className="p-4 space-y-4">
                <div>
                  <h3 className="text-lg font-black tracking-tight text-foreground">{viewIssue.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{viewIssue.description || "No description."}</p>
                </div>

                {/* Reporter info */}
                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-[#0a0a0a] rounded-xl p-3">
                  <div className="w-8 h-8 rounded-full fluid-gradient-bg flex items-center justify-center text-white text-xs font-bold">
                    {(viewIssue.reporter_name || "?")[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{viewIssue.reporter_name || "Anonymous"}</p>
                    <p className="text-[10px] text-zinc-400">Reported on {new Date(viewIssue.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Category", value: viewIssue.category },
                    { label: "Status", value: viewIssue.status, color: viewIssue.status === 'Open' ? 'text-red-500' : viewIssue.status === 'In Progress' ? 'text-orange-500' : 'text-green-500' },
                    { label: "Area", value: viewIssue.area || "Not specified" },
                    { label: "Department", value: viewIssue.department || "Not assigned" },
                  ].map(d => (
                    <div key={d.label} className="bg-zinc-50 dark:bg-[#0a0a0a] rounded-xl p-3">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400">{d.label}</p>
                      <p className={`font-bold text-xs mt-0.5 ${(d as any).color || 'text-foreground'}`}>{d.value}</p>
                    </div>
                  ))}
                </div>

                {/* View on Map */}
                {(viewIssue.latitude && viewIssue.longitude) && (
                  <button
                    onClick={() => openInMap(viewIssue.latitude, viewIssue.longitude)}
                    className="w-full flex items-center justify-center gap-2 bg-zinc-100 dark:bg-[#0a0a0a] hover:bg-zinc-200 dark:hover:bg-[#1a1a1a] text-foreground py-3 rounded-xl font-bold text-xs transition-colors border border-zinc-200 dark:border-[#1a1a1a]"
                  >
                    <MapPin className="w-4 h-4 text-pink-500" />
                    View on Google Maps
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </button>
                )}

                {/* Quick actions */}
                <div className="flex gap-2 pt-1">
                  <button 
                    onClick={() => { setForwardingId(viewIssue.id); setViewIssue(null); }}
                    className="flex-1 flex items-center justify-center gap-2 fluid-gradient-bg text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-[0.98] transition-transform"
                  >
                    <Send className="w-3.5 h-3.5" /> Forward
                  </button>
                  <button 
                    onClick={() => { handleUpdate(viewIssue.id, { status: "Resolved" }); setViewIssue(null); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white py-3 rounded-xl font-bold text-xs shadow-md active:scale-[0.98] transition-transform"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resolve
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
