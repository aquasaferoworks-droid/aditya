
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useFirestore, useDoc } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { SunIcon as Sunburst, Loader2 } from "lucide-react";
import Link from 'next/link';

export default function SignupPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [checkingInit, setCheckingInit] = useState(true);

  // Check if admin is already initialized
  useEffect(() => {
    if (!firestore) return;
    const checkAdmin = async () => {
      const { getDoc } = await import('firebase/firestore');
      const docRef = doc(firestore, 'settings', 'admin');
      const snap = await getDoc(docRef);
      if (snap.exists() && snap.data().initialized) {
        router.push('/login');
      } else {
        setCheckingInit(false);
      }
    };
    checkAdmin();
  }, [firestore, router]);

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth || !firestore) return;
    setError("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // 1. Create User
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      
      // 2. Mark as initialized in Firestore
      await setDoc(doc(firestore, 'settings', 'admin'), {
        initialized: true,
        adminEmail: email,
        createdAt: new Date().toISOString()
      });

      router.push('/admin');
    } catch (err: any) {
      setError(err.message || "Failed to initialize studio.");
    } finally {
      setLoading(false);
    }
  };

  if (checkingInit) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center overflow-hidden p-4">
      <div className="w-full relative max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-2xl rounded-2xl border border-white/5 bg-zinc-950/50 backdrop-blur-xl">
        
        {/* Background Visuals */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black via-transparent to-transparent opacity-60 z-10" />
          <div className="flex absolute z-0 opacity-10">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-[100vh] w-[16.6vw] border-r border-white/5" />
            ))}
          </div>
          <div className="w-[30rem] h-[30rem] bg-primary/20 absolute -bottom-48 -left-48 rounded-full blur-[120px]" />
        </div>
 
        <div className="bg-black/40 p-8 md:p-16 md:w-1/2 relative flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/5 z-20">
          <div className="space-y-6">
            <Link href="/" className="font-headline text-2xl italic tracking-tight block">
              <span className="text-primary">Errol</span> <span className="text-white">Aditya</span>
            </Link>
            <h1 className="text-4xl md:text-5xl font-headline italic font-bold leading-tight tracking-tighter text-white">
              Initialize Your <br /> <span className="text-primary not-italic font-light">Directorial Studio</span>
            </h1>
            <p className="text-white/40 font-body text-sm leading-relaxed max-w-xs italic border-l border-primary/20 pl-4">
              Architecture of emotion. Setup your unique access to the cinematic archive management portal.
            </p>
          </div>
        </div>
 
        <div className="p-8 md:p-16 md:w-1/2 flex flex-col justify-center bg-zinc-900/30 backdrop-blur-3xl z-20">
          <div className="mb-10">
            <div className="text-primary mb-6">
              <Sunburst className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-headline italic text-white tracking-tight mb-2">Get Started</h2>
            <p className="text-white/40 text-sm font-body italic">First-time initialization — Secure your studio.</p>
          </div>
 
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[11px] tracking-widest uppercase text-white/40 font-bold italic">Studio Email</label>
              <input
                type="email"
                id="email"
                placeholder="director@erroladitya.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary transition-all placeholder:text-white/10"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
 
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[11px] tracking-widest uppercase text-white/40 font-bold italic">Master Password</label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white text-sm font-body focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && (
              <p className="text-destructive text-xs italic font-medium bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </p>
            )}
 
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-white text-black font-headline italic font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-2xl"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Initialize Master Account"}
            </button>
 
            <div className="text-center text-white/40 text-xs font-body italic">
              Already initialized?{" "}
              <Link href="/login" className="text-white hover:text-primary underline transition-colors">
                Studio Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
