import type { SocketStatus } from "../../hooks/useSocket";

const config: Record<SocketStatus, { label: string; dot: string }> = {
  connecting: { label: "Connecting…", dot: "bg-yellow-500" },
  reconnecting: { label: "Reconnecting…", dot: "bg-yellow-500" },
  open: { label: "Connected", dot: "bg-green-500" },
  closed: { label: "Disconnected", dot: "bg-gray-400" },
  unauthorized: { label: "Session expired, sign in again", dot: "bg-red-500" },
};

export function ConnectionStatus({ status }: { status: SocketStatus }) {
  const { label, dot } = config[status];
  return (
    <span className="inline-flex items-center gap-2 text-xs text-gray-600" role="status">
      <span className={`h-2 w-2 rounded-full ${dot}`} />
      {label}
    </span>
  );
}