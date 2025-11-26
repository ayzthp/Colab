
'use client';

import { use } from 'react';
import { Room } from "./Room";
import RoomClient from "@/components/room/room-client";

export default function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = use(params);
  
  return (
    <Room roomId={roomId}>
      <RoomClient roomId={roomId} />
    </Room>
  );
}
