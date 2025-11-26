
'use client';

import { useEffect, useState } from 'react';
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
import { MoreHorizontal, Copy, Check, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

interface ParticipantsSidebarProps {
  roomId: string;
  awareness: any; // Yjs Awareness
  currentUserId: string;
}

export function ParticipantsSidebar({
  roomId,
  awareness,
  currentUserId,
}: ParticipantsSidebarProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);

  useEffect(() => {
    if (!awareness) return;

    const updateParticipants = () => {
      const states = Array.from(awareness.getStates().values());
      // Filter out users who haven't set their user data yet
      const users = states
        .map((state: any) => state.user)
        .filter((user) => user);
        
      // Remove duplicates based on ID if necessary (though awareness handles clientIDs)
      // Actually, awareness tracks sessions. If a user has multiple tabs open, they appear twice.
      // We can dedupe by user.id if we want unique users vs unique connections.
      
      setParticipants(users);
    };

    updateParticipants();

    awareness.on('change', updateParticipants);

    return () => {
      awareness.off('change', updateParticipants);
    };
  }, [awareness]);

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

  return (
    <aside className="hidden w-72 flex-col border-l bg-muted/40 md:flex">
      <Card className="m-4 border-none bg-transparent shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Users ({participants.length})</span>
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
              {participants.map((p, index) => (
                <div
                  key={`${p.id}-${index}`}
                  className="flex items-center justify-between rounded-lg p-2 hover:bg-accent"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9" style={{ border: `2px solid ${p.color}` }}>
                      <AvatarFallback>{getInitials(p.name)}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {p.name} {p.id === currentUserId && '(You)'}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                         <span style={{ color: p.color }}>●</span> Online
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
