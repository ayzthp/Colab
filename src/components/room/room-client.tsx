
'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@/firebase';
import { useYjs } from '@/hooks/use-yjs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import dynamic from 'next/dynamic';
const Whiteboard = dynamic(() => import('./whiteboard').then(mod => mod.Whiteboard), {
  ssr: false,
});
import { ParticipantsSidebar } from './participants-sidebar';
import { CodeEditor } from './code-editor';
import { Palette, Code, Loader2, Copy, Check, Wifi, WifiOff } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
} from '@/firebase/non-blocking-login';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { getAuth } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase';

export default function RoomClient({ roomId }: { roomId: string }) {
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  const app = useFirebaseApp();
  const auth = getAuth(app);

  // Memoize user color so it doesn't change on every render
  const userColor = useMemo(() => '#' + Math.floor(Math.random() * 16777215).toString(16), []);

  // Initialize Yjs
  const { ydoc, provider, status } = useYjs(roomId, {
    uid: user?.uid || 'anonymous',
    name: user?.email || 'Anonymous',
    color: userColor,
  });

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({ title: 'Room link copied!' });
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleSignUp = async () => {
    if (!email || !password) {
      setAuthError('Please enter email and password.');
      return;
    }
    setAuthError(null);
    initiateEmailSignUp(auth, email, password);
  };

  const handleSignIn = async () => {
    if (!email || !password) {
      setAuthError('Please enter email and password.');
      return;
    }
    setAuthError(null);
    initiateEmailSignIn(auth, email, password);
  };


  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 p-4 text-center">
        <div className="w-full max-w-sm space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Sign in to join</h2>
            <p className="text-muted-foreground">Collaboration requires an account.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {authError && <p className="text-sm text-destructive">{authError}</p>}
          <div className="flex gap-2">
            <Button className="w-full" onClick={handleSignIn}>Sign In</Button>
            <Button variant="secondary" className="w-full" onClick={handleSignUp}>Sign Up</Button>
          </div>
          <Button variant="link" asChild><Link href="/">Back to Home</Link></Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full flex-col">
      <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span>CollabCanvas</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="font-mono text-sm">{roomId}</span>
          {status === 'connected' ? (
            <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
              <Wifi className="h-3 w-3" /> Connected
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-red-600 bg-red-100 px-2 py-1 rounded-full">
              <WifiOff className="h-3 w-3" /> {status}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleCopyLink}>
            {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Link'}
          </Button>
        </div>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <main className="flex-1 overflow-auto">
          <Tabs defaultValue="whiteboard" className="flex h-full flex-col">
            <div className="flex items-center border-b p-4">
              <TabsList>
                <TabsTrigger value="whiteboard">
                  <Palette className="mr-2 h-4 w-4" />
                  Whiteboard
                </TabsTrigger>
                <TabsTrigger value="code">
                  <Code className="mr-2 h-4 w-4" />
                  Code Editor
                </TabsTrigger>
              </TabsList>
              <div className="ml-auto text-sm text-muted-foreground">
                Real-time Sync Active
              </div>
            </div>
            <TabsContent value="whiteboard" className="m-0 flex-1 overflow-auto">
               <Whiteboard ydoc={ydoc} provider={provider} />
            </TabsContent>
            <TabsContent value="code" className="m-0 flex-1 overflow-auto">
               <CodeEditor ydoc={ydoc} provider={provider} />
            </TabsContent>
          </Tabs>
        </main>
        <ParticipantsSidebar
          roomId={roomId}
          awareness={provider?.awareness}
          currentUserId={user.uid}
        />
      </div>
    </div>
  );
}
