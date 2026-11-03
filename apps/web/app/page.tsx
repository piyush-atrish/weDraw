import { Navbar } from "./components/Navbar";
import { Heading } from "./components/ui/Heading";
import { RoomPanel } from "./components/RoomPanel";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="mx-auto flex max-w-2xl flex-col gap-10 px-4 py-24">
        <Heading title="Draw in real time" subtitle="Create a room or jump into an existing one." />
        <RoomPanel />
      </main>
    </div>
  );
}