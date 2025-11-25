
'use client';

import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore, errorEmitter, FirestorePermissionError } from '@/firebase';
import type { Participant } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Crown, MoreHorizontal, Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface ParticipantsSidebarProps {
  roomId: string;
  participants: Participant[];
  hostId: string;
  writingPowerId?: string;
  codeWritingPowerId?: string;
  currentUserId: string;
  isHost: boolean;
}

export function ParticipantsSidebar({
  roomId,
  participants,
  hostId,
  writingPowerId,
  codeWritingPowerId,
  currentUserId,
  isHost,
}: ParticipantsSidebarProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const firestore = useFirestore();

  const getInitials = (name: string) => {
    if (!name) return 'A';
    if (name.includes('@')) {
      const emailPrefix = name.split('@')[0];
      return emailPrefix.substring(0, 2).toUpperCase();
    }
    return name
      .split(' ')
      .map((n) => n[0])
      .join('');
  };

  const handlePermissionChange = async (
    type: 'host' | 'whiteboardWriter' | 'codeWriter',
    newUid: string
  ) => {
    if (!firestore || !isHost) return;
    let docRef;
    let payload;

    if (type === 'host') {
      docRef = doc(firestore, 'rooms', roomId);
      payload = { hostId: newUid };
    } else if (type === 'whiteboardWriter') {
      docRef = doc(firestore, 'rooms', roomId);
      payload = { writingPowerId: newUid };
    } else { // codeWriter
      docRef = doc(firestore, `rooms/${roomId}/codeEditorData`, 'data');
      payload = { writingPowerId: newUid };
    }

    updateDoc(docRef, payload)
      .then(() => {
        toast({
          title: 'Permissions Updated',
          description: `Control has been transferred.`,
        });
      })
      .catch((error: any) => {
        errorEmitter.emit('permission-error', new FirestorePermissionError({
            path: docRef.path,
            operation: 'update',
            requestResourceData: payload
        }));
        toast({
          variant: 'destructive',
          title: 'Error',
          description: `Failed to update permissions. Only the host can perform this action.`,
        });
      });
  };

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: 'Room link copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <aside className="hidden w-72 flex-col border-l bg-muted/40 md:flex">
      <Card className="m-4 border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Participants ({participants.length})</span>
            <Button onClick={copyRoomLink} variant="ghost" size="icon">
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-12rem)]">
            <div className="space-y-2 p-4 pt-0">
              {participants.map((p) => (
                <div
                  key={p.uid}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={p.avatar} />
                      <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {p.name} {p.uid === currentUserId && '(You)'}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {p.uid === hostId && (
                          <Crown className="h-3 w-3 text-amber-500" />
                        )}
                        {p.uid === writingPowerId && (
                          <span className="text-blue-500">Board</span>
                        )}
                        {p.uid === codeWritingPowerId && (
                          <span className="text-purple-500">Code</span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isHost && p.uid !== currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handlePermissionChange('host', p.uid)}
                        >
                          Make Host
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handlePermissionChange('whiteboardWriter', p.uid)
                          }
                        >
                          Grant Whiteboard Control
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handlePermissionChange('codeWriter', p.uid)
                          }
                        >
                          Grant Code Control
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  );
}
