import { ButtonLink } from "../ui/Button";

export function RoomDeleted() {
  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
      <h1 className="text-xl font-semibold text-gray-900">This room was deleted</h1>
      <p className="text-sm text-gray-600">The room and all of its messages have been removed.</p>
      <ButtonLink href="/">Back to home</ButtonLink>
    </main>
  );
}