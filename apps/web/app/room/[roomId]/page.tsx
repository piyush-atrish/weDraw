import { notFound } from "next/navigation";
import { RequireAuth } from "../../components/AuthGate";
import { RoomView } from "../../components/room/RoomView";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const id = Number(roomId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  return (
    <RequireAuth>
      <RoomView roomId={id} />
    </RequireAuth>
  );
}