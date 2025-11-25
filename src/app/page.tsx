
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, FirestorePermissionError, errorEmitter } from '@/firebase';
import {
  initiateEmailSignUp,
  initiateEmailSignIn,
} from '@/firebase/non-blocking-login';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Code, Users, Palette } from 'lucide-react';
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
} from 'firebase/firestore';

import type { Room } from '@/types';
import { getAuth, signOut as firebaseSignOut } from 'firebase/auth';
import { useFirebaseApp } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  const [roomId, setRoomId] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const { toast } = useToast();

  const app = useFirebaseApp();
  const auth = getAuth(app);
  const firestore = useFirestore();

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

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const handleCreateRoom = async () => {
    if (!user || !firestore) return;
    setIsCreating(true);
  
    const newRoomRef = doc(collection(firestore, 'rooms'));
    const newRoomId = newRoomRef.id;
  
    const newRoom: Room = {
      id: newRoomId,
      hostId: user.uid,
      name: `${user.email}'s Room`,
      createdAt: serverTimestamp() as any,
      members: {
        [user.uid]: {
          uid: user.uid,
          name: user.email || 'Anonymous',
          avatar: user.photoURL || '',
        },
      },
      writingPowerId: user.uid, // The host starts with whiteboard power
    };
  
    // Create the room document first
    setDoc(newRoomRef, newRoom).then(() => {
      // After room is created, create the sub-collection documents
      // We will create one initial path document for whiteboard
      const whiteboardPathRef = doc(collection(firestore, `rooms/${newRoomId}/whiteboardData`));
      const codeEditorRef = doc(firestore, `rooms/${newRoomId}/codeEditorData`, 'data');
  
      const whiteboardPromise = setDoc(whiteboardPathRef, {
        id: whiteboardPathRef.id,
        color: '#000000',
        points: [],
      });
  
      const codeEditorPromise = setDoc(codeEditorRef, {
        roomId: newRoomId,
        code: `function hello(name) {\n  console.log('Hello, ' + name);\n}\n\nhello('world');`,
        language: 'javascript',
        input: '',
        output: '',
        writingPowerId: user.uid,
      });
  
      // Wait for sub-collections to be created, then navigate
      Promise.all([whiteboardPromise, codeEditorPromise]).then(() => {
        router.push(`/room/${newRoomId}`);
      }).catch(subError => {
        const errorPath = subError.message.includes('whiteboard') ? whiteboardPathRef.path : codeEditorRef.path;
        errorEmitter.emit('permission-error', new FirestorePermissionError({
          path: errorPath,
          operation: 'create',
          requestResourceData: subError.message.includes('whiteboard') ? {id: whiteboardPathRef.id} : {roomId: newRoomId},
        }));

        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "Could not initialize room details. Please try again.",
        });
        setIsCreating(false);
      });
    }).catch(error => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: newRoomRef.path,
        operation: 'create',
        requestResourceData: newRoom,
      }));
  
      setIsCreating(false);
    });
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (roomId.trim() && firestore) {
      const roomRef = doc(firestore, 'rooms', roomId.trim());
      try {
        const docSnap = await getDoc(roomRef);
        if (docSnap.exists()) {
          router.push(`/room/${roomId.trim()}`);
        } else {
          alert('Room does not exist.');
        }
      } catch (error) {
        console.error('Error joining room:', error);
        alert('Could not check if room exists. Please try again.');
      }
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return 'A';
    const emailPrefix = name.split('@')[0];
    return emailPrefix.substring(0, 2).toUpperCase();
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <header className="absolute top-8 flex items-center gap-2">
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="32" height="32" rx="8" fill="hsl(var(--primary))" />
          <path
            d="M10 10H22V22H10V10Z"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="2"
          />
          <path
            d="M14 14H18"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M16 14V18"
            stroke="hsl(var(--primary-foreground))"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <h1 className="text-2xl font-bold text-foreground">CollabCanvas</h1>
      </header>

      <main className="flex w-full max-w-7xl flex-grow items-center justify-center">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="space-y-4">
            <h2 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Collaborate in Real-Time.
            </h2>
            <p className="text-lg text-muted-foreground">
              A shared space with a whiteboard and code editor. Draw, code, and
              run it, all with your team.
            </p>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <span className="font-medium">Live Whiteboard</span>
              </div>
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <span className="font-medium">Live Code Editor</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="font-medium">Host Controls</span>
              </div>
            </div>
          </div>

          <Card className="w-full max-w-md shadow-lg">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                {user
                  ? 'Create a new room or join an existing one.'
                  : 'Sign in or create an account to start collaborating.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {isUserLoading ? (
                <div className="flex h-10 items-center justify-center">
                  <p>Authenticating...</p>
                </div>
              ) : user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={user.photoURL || undefined} />
                      <AvatarFallback>
                        {getInitials(user.email)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.email}</span>
                  </div>
                  <Button variant="outline" onClick={signOut}>
                    Sign Out
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
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
                  {authError && (
                    <p className="text-sm text-destructive">{authError}</p>
                  )}
                  <div className="flex gap-2">
                    <Button className="w-full" onClick={handleSignIn}>
                      Sign In
                    </Button>
                    <Button
                      variant="secondary"
                      className="w-full"
                      onClick={handleSignUp}
                    >
                      Sign Up
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            {user && (
              <CardFooter className="flex flex-col gap-4">
                <Button
                  className="w-full"
                  onClick={handleCreateRoom}
                  disabled={isCreating}
                >
                  {isCreating ? 'Creating...' : 'Create New Room'}
                </Button>
                <div className="w-full text-center text-xs text-muted-foreground">
                  OR
                </div>
                <form
                  onSubmit={handleJoinRoom}
                  className="flex w-full space-x-2"
                >
                  <Input
                    type="text"
                    placeholder="Enter Room ID"
                    value={roomId}
                    onChange={(e) => setRoomId(e.target.value)}
                    disabled={isCreating}
                  />
                  <Button
                    type="submit"
                    variant="secondary"
                    disabled={isCreating}
                  >
                    Join
                  </Button>
                </form>
              </CardFooter>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}
