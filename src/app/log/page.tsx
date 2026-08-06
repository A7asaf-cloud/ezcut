import Link from "next/link";
import DailyLogForm from "@/components/DailyLogForm";

// Renders a client component that talks to Supabase using the browser
// client — skip static prerendering so it doesn't need env vars at build time.
export const dynamic = "force-dynamic";

export default function LogPage() {
  return (
    <main className="min-h-screen bg-neutral-950 p-6">
      <div className="mx-auto max-w-lg pt-10 pb-16">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Daily log</h1>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            View dashboard →
          </Link>
        </div>
        <DailyLogForm />
      </div>
    </main>
  );
}
