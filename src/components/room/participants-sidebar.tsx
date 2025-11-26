
'use client';

import { useState } from 'react';
import { useOthers, useSelf } from "@liveblocks/react/suspense";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface ParticipantsSidebarProps {
  roomId: string;
}

export function ParticipantsSidebar({ roomId }: ParticipantsSidebarProps) {
  const others = useOthers();
  const currentUser = useSelf();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

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

  const copyRoomLink = () => {
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast({ title: 'Room link copied to clipboard!' });
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to extract user info from presence/info
  // Since we are not using Liveblocks custom auth, info might be empty.
  // We will use the presence data we set in useYjs (which syncs to Liveblocks presence)
  // OR we can trust useSelf().info if we had an auth endpoint.
  // For now, let's try to get name/color from presence if available, or fallback.
  
  // Note: The user data set in use-yjs via provider.awareness.setLocalStateField
  // DOES NOT automatically populate Liveblocks 'info'.
  // However, Liveblocks Yjs Provider syncs awareness.
  // Let's stick to the 'others' list which contains presence.
  
  // Actually, for this "strict Liveblocks" implementation, we should probably set presence using useMyPresence in RoomClient too?
  // But let's see if we can extract it from what we have.
  
  // Simplified view: Just list connection IDs if no info.
  // But wait, use-yjs sets 'user' field on awareness. Liveblocks Yjs provider maps this.
  // But useOthers() returns Liveblocks presence.
  
  // Let's assume 'others' works for count at least.
  // To get names, we might need to look at `other.presence.user` if mapped.

  return (
    <aside className="hidden w-72 flex-col border-l bg-muted/40 md:flex">
      <Card className="m-4 border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Users ({others.length + 1})</span>
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
              {/* Current User */}
              {currentUser && (
                <div className="flex items-center justify-between rounded-lg p-2 bg-accent/50">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border-2 border-blue-500">
                      <AvatarFallback>You</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        You (Connection {currentUser.connectionId})
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <span className="text-green-500">●</span> Online
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Others */}
              {others.map((other) => (
                <div
                  key={other.connectionId}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>U{other.connectionId % 9}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        User {other.connectionId}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <span className="text-green-500">●</span> Online
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </aside>
  );
}
