
'use client';

import RoomClient from "@/components/room/room-client";
import { LiveblocksProvider, RoomProvider } from "@liveblocks/react";
import { client } from "@/liveblocks.config";
import { Loader2 } from "lucide-react";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  return (
    <LiveblocksProvider client={client}>
      <RoomProvider
        id={`collab-canvas-${params.roomId}`}
        initialPresence={{
          cursor: null,
        }}
        fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}
      >
        <RoomClient roomId={params.roomId} />
      </RoomProvider>
    </LiveblocksProvider>
  );
}
