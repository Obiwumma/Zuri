/**
 * Fixed corner badge rendered inside the app shells for demo sessions,
 * so nobody mistakes sample data for real institution data.
 */
export function DemoSessionBadge() {
  return (
    <div
      role="status"
      className="pointer-events-none fixed bottom-3 left-1/2 z-50 -translate-x-1/2 rounded-full bg-amber-500 px-3 py-1 text-caption font-semibold text-black shadow-md"
    >
      Demo session · sample data
    </div>
  );
}
