import { notFound } from "next/navigation";
import { Navbar } from "../../components/Navbar";
import { RequireAuth } from "../../components/AuthGate";
import { ChatRoom } from "../../components/chat/ChatRoom";

export default async function RoomPage({ params }: { params: Promise<{ roomId: string }> }) {
  const { roomId } = await params;
  const id = Number(roomId);
  if (!Number.isInteger(id) || id <= 0) notFound();

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <Navbar />
      <RequireAuth>
        <ChatRoom roomId={id} />
      </RequireAuth>
    </div>
  );
}