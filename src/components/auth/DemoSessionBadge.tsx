/**
 * Fixed corner badge rendered inside the app shells for demo sessions,
 * so nobody mistakes sample data for real institution data.
 */
export function DemoSessionBadge() {
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-3 right-3 z-50 rounded-full bg-amber-500/90 px-2.5 py-0.5 text-[11px] font-semibold text-black shadow-md"
    >
      Demo · sample data
    </div>
  );
}
