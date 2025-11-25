import RoomClient from "@/components/room/room-client";

export default function RoomPage({ params }: { params: { roomId: string } }) {
  return <RoomClient roomId={params.roomId} />;
}
