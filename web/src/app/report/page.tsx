"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, Send, AlertTriangle, ArrowLeft, X, Navigation, Search, User } from "lucide-react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const categories = ["Potholes", "Waste Management", "Water Supply", "Streetlights", "Public Transport", "Others"];

export default function ReportPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);

  // Form State
  const [reporterName, setReporterName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Potholes");
  const [urgency, setUrgency] = useState(50);
  
  // Location State
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [locationMode, setLocationMode] = useState<"none" | "gps" | "type" | "map">("none");
  const [isLocating, setIsLocating] = useState(false);
  const [locationLabel, setLocationLabel] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapPin, setMapPin] = useState<{ x: number; y: number } | null>(null);
  
  // Media State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Prefill reporter name from session
  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const name = session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "";
        setReporterName(name);
      }
    };
    getUser();
  }, []);
  
  // AI Categorization Debounce
  useEffect(() => {
    const handler = setTimeout(() => {
      if (description.length > 10) {
        setIsClassifying(true);
        fetch("/api/classify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: description, labels: categories }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (Array.isArray(data) && data.length > 0 && data[0].label) {
              setCategory(data[0].label);
            } else if (data?.labels?.length > 0) {
              setCategory(data.labels[0]);
            }
          })
          .catch((err) => console.log("AI Classification failed", err))
          .finally(() => setIsClassifying(false));
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [description]);

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setLocationMode("gps");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setLatitude(lat);
          setLongitude(lng);
          // Reverse geocode via Nominatim (free, no API key)
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`);
            const data = await res.json();
            const addr = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setAddress(addr);
            setLocationLabel(addr);
          } catch {
            setAddress(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
            setLocationLabel(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
          }
          setIsLocating(false);
        },
        () => {
          setIsLocating(false);
          alert("Location access denied. Please type your address manually.");
          setLocationMode("type");
        },
        { enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
      setLocationMode("type");
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mapRef.current) return;
    const rect = mapRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMapPin({ x, y });
    // Convert pixel to approximate lat/lng (simplified for demo — centered on India)
    const lat = 28.6 - (y / rect.height) * 10;
    const lng = 77.2 + (x / rect.width) * 10;
    setLatitude(parseFloat(lat.toFixed(4)));
    setLongitude(parseFloat(lng.toFixed(4)));
    setAddress(`Pinned: ${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E`);
    setLocationLabel(`Pinned on map`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      if (files.length + newFiles.length > 5) {
        alert("Maximum 5 photos allowed.");
        return;
      }
      setFiles((prev) => [...prev, ...newFiles]);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const uploadedUrls: string[] = [];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `reports/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('issue-photos')
          .upload(filePath, file);

        if (!uploadError && uploadData) {
          const { data } = supabase.storage.from('issue-photos').getPublicUrl(uploadData.path);
          uploadedUrls.push(data.publicUrl);
        }
      }

      const { error } = await supabase
        .from('issues')
        .insert([{ 
          title, 
          description, 
          category, 
          status: 'Open', 
          urgency,
          image_urls: uploadedUrls,
          latitude: latitude || 19.0760,
          longitude: longitude || 72.8777,
          area: address || "Not specified",
          reporter_name: reporterName,
          user_id: session?.user?.id || null,
        }]);
        
      if (error) {
        console.warn("Insert failed:", error);
      }
      setIsSubmitting(false);
      setIsSuccess(true);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
      setIsSuccess(true);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-6">
        <motion.div
           initial={{ scale: 0 }}
           animate={{ scale: 1 }}
           transition={{ type: "spring", bounce: 0.5 }}
           className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green-500/30"
        >
          <motion.svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <motion.path initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.5, delay: 0.2 }} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </motion.svg>
        </motion.div>
        <h2 className="text-2xl font-black mb-2 text-center">Reported Successfully</h2>
        <p className="text-zinc-500 text-sm mb-8 max-w-sm text-center">Authorities have been notified. Track progress from your dashboard.</p>
        <Link href="/dashboard">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="fluid-gradient-bg text-white px-8 py-3 rounded-full font-bold shadow-lg">
            Track My Issue
          </motion.button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
      <div className="max-w-lg mx-auto pt-6">
        <Link href="/dashboard" className="inline-flex items-center text-zinc-400 hover:text-foreground mb-6 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Link>
        
        <motion.div
           initial={{ y: 20, opacity: 0 }}
           animate={{ y: 0, opacity: 1 }}
           className="bg-white dark:bg-[#121212] rounded-2xl border border-zinc-100 dark:border-[#262626] overflow-hidden"
        >
          <div className="p-6 border-b border-zinc-100 dark:border-[#262626]">
            <h1 className="text-xl font-black flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-pink-500" /> Report an Issue
            </h1>
            <p className="text-zinc-500 text-xs mt-1">Provide clear details to help authorities respond faster.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
            
            {/* Reporter Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Your Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input 
                  required
                  value={reporterName}
                  onChange={e => setReporterName(e.target.value)}
                  placeholder="Full name" 
                  className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#262626] rounded-xl px-4 py-3 pl-10 outline-none focus:border-pink-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Issue Title</label>
              <input 
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Broken streetlight on MG Road" 
                className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#262626] rounded-xl px-4 py-3 outline-none focus:border-pink-500 transition-all text-sm"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-2">
                Description
                {isClassifying && (
                  <span className="text-pink-500 flex items-center gap-1 animate-pulse normal-case">
                    classifying <div className="w-3 h-3 border border-pink-500 border-t-transparent rounded-full animate-spin"/>
                  </span>
                )}
              </label>
              <textarea 
                required rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Describe the issue. AI will auto-tag the category..." 
                className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#262626] rounded-xl px-4 py-3 outline-none focus:border-pink-500 transition-all text-sm resize-none"
              />
            </div>

            {/* Category Pills */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 text-xs rounded-full transition-all border font-bold ${
                      category === cat 
                        ? 'fluid-gradient-bg text-white border-transparent shadow-md' 
                        : 'bg-zinc-50 dark:bg-[#0a0a0a] border-zinc-200 dark:border-[#262626] text-zinc-600 dark:text-zinc-400 hover:border-pink-500/50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* ========== OLA/UBER LOCATION PICKER ========== */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Location
              </label>

              {/* Location method buttons */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={handleUseCurrentLocation}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                    locationMode === "gps" ? "border-pink-500 bg-pink-500/10 text-pink-500" : "border-zinc-200 dark:border-[#262626] text-zinc-500 hover:border-pink-500/50"
                  }`}
                >
                  <Navigation className="w-4 h-4" />
                  {isLocating ? "Locating..." : "Current"}
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("type")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                    locationMode === "type" ? "border-pink-500 bg-pink-500/10 text-pink-500" : "border-zinc-200 dark:border-[#262626] text-zinc-500 hover:border-pink-500/50"
                  }`}
                >
                  <Search className="w-4 h-4" />
                  Type
                </button>
                <button
                  type="button"
                  onClick={() => setLocationMode("map")}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-bold transition-all ${
                    locationMode === "map" ? "border-pink-500 bg-pink-500/10 text-pink-500" : "border-zinc-200 dark:border-[#262626] text-zinc-500 hover:border-pink-500/50"
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  Pin Map
                </button>
              </div>

              {/* GPS result */}
              {locationMode === "gps" && locationLabel && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="bg-green-500/10 text-green-600 dark:text-green-400 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5" />
                  {locationLabel}
                </motion.div>
              )}

              {/* Type address */}
              {locationMode === "type" && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                  <input 
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="Type your full address..." 
                    className="w-full bg-zinc-50 dark:bg-[#0a0a0a] border border-zinc-200 dark:border-[#262626] rounded-xl px-4 py-3 outline-none focus:border-pink-500 transition-all text-sm"
                  />
                </motion.div>
              )}

              {/* Pin on map */}
              {locationMode === "map" && (
                <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                  <div 
                    ref={mapRef}
                    onClick={handleMapClick}
                    className="relative w-full h-48 rounded-xl overflow-hidden border border-zinc-200 dark:border-[#262626] cursor-crosshair bg-zinc-100 dark:bg-[#0a0a0a]"
                  >
                    {/* Embedded OpenStreetMap tile */}
                    <iframe 
                      src="https://www.openstreetmap.org/export/embed.html?bbox=72.7,18.9,73.0,19.2&layer=mapnik"
                      className="w-full h-full border-0 pointer-events-none opacity-70"
                      title="Map"
                    />
                    {/* Click overlay */}
                    <div className="absolute inset-0" />
                    {/* Pin */}
                    {mapPin && (
                      <motion.div
                        initial={{ scale: 0, y: -20 }}
                        animate={{ scale: 1, y: 0 }}
                        className="absolute"
                        style={{ left: mapPin.x - 12, top: mapPin.y - 24 }}
                      >
                        <MapPin className="w-6 h-6 text-pink-500 drop-shadow-lg" fill="#ec4899" />
                      </motion.div>
                    )}
                    {!mapPin && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-xs font-bold text-zinc-400 bg-white/80 dark:bg-black/80 px-3 py-1.5 rounded-full">Tap to pin location</p>
                      </div>
                    )}
                  </div>
                  {address && <p className="text-xs text-pink-500 font-medium mt-2">{address}</p>}
                </motion.div>
              )}
            </div>

            {/* Urgency */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">Urgency</label>
              <input type="range" min="0" max="100" value={urgency} onChange={e => setUrgency(Number(e.target.value))} className="w-full accent-pink-500" />
              <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase">
                <span>Low</span><span>Moderate</span><span className="text-red-500">Critical</span>
              </div>
            </div>
            
            {/* Photos */}
            <div className="space-y-2">
              <input type="file" multiple accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="w-full border border-dashed border-zinc-300 dark:border-[#262626] rounded-xl py-4 flex flex-col items-center gap-1.5 text-zinc-400 hover:border-pink-500/50 transition-colors"
              >
                <Camera className="w-5 h-5" />
                <span className="text-xs font-bold">Upload Photos (Max 5)</span>
              </button>
              {previews.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {previews.map((src, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 dark:border-[#262626]">
                      <img src={src} alt="Preview" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeFile(idx)} className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full fluid-gradient-bg text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all mt-2 active:scale-[0.98] shadow-lg disabled:opacity-60"
            >
              {isSubmitting ? (
                 <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Submit Report <Send className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
