"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MapPin, AlertCircle, CheckCircle2, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden selection:bg-pink-500/30">
      
      {/* Heavy Fluid Gradient Background */}
      <motion.div 
        animate={{ filter: ["hue-rotate(0deg)", "hue-rotate(20deg)", "hue-rotate(0deg)"] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 pointer-events-none z-0"
      >
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[70%] rounded-full fluid-gradient-bg blur-[140px] opacity-20 dark:opacity-30 mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-20%] w-[50%] h-[60%] rounded-full fluid-gradient-bg blur-[160px] opacity-30 dark:opacity-40 mix-blend-screen" />
      </motion.div>

      {/* Modern Floating Navbar */}
      <motion.nav 
        initial={{ y: -50, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex justify-center p-6 w-full z-20 sticky top-0"
      >
        <div className="flex items-center justify-between w-full max-w-5xl glass-panel rounded-full px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full overflow-hidden">
              <img src="/logo.png" alt="Loksetu" className="w-full h-full object-cover" />
            </div>
            <span className="font-bold text-xl tracking-tight">Loksetu</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold hover:opacity-70 transition-opacity">Sign in</Link>
            <Link href="/login" className="text-sm font-bold bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full hover:scale-105 active:scale-95 transition-transform shadow-xl">
              Sign Up
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Massive Minimal Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 max-w-5xl mx-auto mt-10 md:mt-0 tracking-tight">
        
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-bold mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500"></span>
            </span>
            Loksetu 2.0 is live
          </span>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 leading-[1.1]">
            Your city.<br />
            <span className="fluid-gradient-text">Mastered.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto leading-relaxed font-medium">
            The next-generation civic platform. Beautifully track, report, and resolve structural issues with absolute clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group flex items-center gap-2 bg-foreground text-background px-10 py-5 rounded-[2rem] font-bold shadow-2xl w-full sm:w-auto justify-center text-lg"
              >
                Log in to Report
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </main>

      {/* Feature ticker */}
      <motion.div 
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="w-full pb-12 z-10"
      >
        <div className="max-w-4xl mx-auto glass-panel rounded-3xl p-6 flex flex-wrap justify-between gap-6 md:gap-12 text-sm font-bold">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full fluid-gradient-bg flex items-center justify-center"><CheckCircle2 className="w-4 h-4 text-white" /></div> 
            AI Tagging
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full fluid-gradient-bg flex items-center justify-center"><MapPin className="w-4 h-4 text-white" /></div>
            Auto-GPS
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full fluid-gradient-bg flex items-center justify-center"><AlertCircle className="w-4 h-4 text-white" /></div> 
            Live Sync
          </div>
        </div>
      </motion.div>
    </div>
  );
}
