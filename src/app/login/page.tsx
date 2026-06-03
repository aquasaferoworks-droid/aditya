
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser } from '@/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { VaelHeader } from '@/components/VaelHeader';

export default function LoginPage() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/admin');
    }
  }, [user, loading, router]);

  const handleSignIn = async () => {
    if (!auth) return;
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (error) {
      console.error('Sign in error', error);
    }
  };

  if (loading) return null;

  return (
    <main className="min-h-screen bg-background flex flex-col items-center justify-center p-8">
      <VaelHeader />
      <div className="max-w-md w-full space-y-12 text-center">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-headline italic font-bold tracking-tighter">
            ADMIN <span className="text-primary not-italic font-light">ACCESS</span>
          </h1>
          <p className="text-muted-foreground font-body text-sm tracking-widest uppercase">
            Authorized personnel only. Archive management portal.
          </p>
        </div>
        
        <Button 
          onClick={handleSignIn}
          className="w-full rounded-none bg-primary text-primary-foreground py-8 h-auto text-[11px] tracking-[0.2em] uppercase font-bold hover:bg-accent transition-all"
        >
          Sign in with Google
        </Button>
      </div>
    </main>
  );
}
