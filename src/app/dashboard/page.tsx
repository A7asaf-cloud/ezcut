import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import WeightChart from "@/components/WeightChart";
import PhotoGallery from "@/components/PhotoGallery";
import FeedbackCard from "@/components/FeedbackCard";
import SignOutButton from "@/components/SignOutButton";
import type { DailyLog } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: logs } = await supabase
    .from("daily_logs")
    .select("*")
    .order("log_date", { ascending: true })
    .returns<DailyLog[]>();

  const allLogs = logs ?? [];

  const photos = await Promise.all(
    allLogs.map(async (log) => {
      const { data } = await supabase.storage
        .from("physique-photos")
        .createSignedUrl(log.physique_photo_path, 3600);
      return { date: log.log_date, url: data?.signedUrl ?? "" };
    })
  );

  const chartData = allLogs.map((log) => ({
    date: log.log_date,
    weightKg: Number(log.weight_kg),
  }));

  const latest = allLogs[allLogs.length - 1];

  return (
    <main className="min-h-screen bg-neutral-950 p-6">
      <div className="mx-auto max-w-4xl space-y-8 pt-10 pb-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">EZCut Dashboard</h1>
            <p className="text-sm text-neutral-500">{user?.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/log"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
            >
              Log today
            </Link>
            <SignOutButton />
          </div>
        </div>

        {latest?.ai_feedback && (
          <FeedbackCard date={latest.log_date} feedback={latest.ai_feedback} />
        )}

        <section className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          <h2 className="mb-4 font-semibold text-white">Weight trend</h2>
          <WeightChart data={chartData} />
        </section>

        <section className="rounded-2xl border border-white/10 bg-neutral-900 p-6">
          <h2 className="mb-4 font-semibold text-white">Progress photos</h2>
          <PhotoGallery photos={photos} />
        </section>
      </div>
    </main>
  );
}
