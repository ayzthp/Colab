
"use client";

import { ReactNode } from "react";
import {
  LiveblocksProvider,
  RoomProvider,
  ClientSideSuspense,
} from "@liveblocks/react/suspense";
import { Loader2 } from "lucide-react";

export function Room({ children, roomId }: { children: ReactNode; roomId: string }) {
  return (
    <LiveblocksProvider publicApiKey={"pk_dev_zNvuLkpUTPxdr1ArXVbb0rHjG67Ic0aPcFL9ZwyjhYNJ2B3skHYUWlIhb5jLKeoX"}>
      <RoomProvider id={`collab-canvas-${roomId}`} initialPresence={{ cursor: null }}>
        <ClientSideSuspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
          {children}
        </ClientSideSuspense>
      </RoomProvider>
    </LiveblocksProvider>
  );
}

