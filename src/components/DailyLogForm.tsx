"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function DailyLogForm() {
  const router = useRouter();
  const supabase = createClient();

  const [logDate, setLogDate] = useState(todayIso());
  const [weightKg, setWeightKg] = useState("");
  const [physiqueFile, setPhysiqueFile] = useState<File | null>(null);
  const [menuFile, setMenuFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "coaching">(
    "idle"
  );
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFeedback(null);

    if (!physiqueFile || !menuFile) {
      setError("Please select both a physique photo and a menu screenshot.");
      return;
    }

    try {
      setStatus("uploading");

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");

      const physiquePath = `${user.id}/${logDate}/physique-${Date.now()}.${physiqueFile.name.split(".").pop()}`;
      const menuPath = `${user.id}/${logDate}/menu-${Date.now()}.${menuFile.name.split(".").pop()}`;

      const [physiqueUpload, menuUpload] = await Promise.all([
        supabase.storage
          .from("physique-photos")
          .upload(physiquePath, physiqueFile, { upsert: true }),
        supabase.storage
          .from("meal-screenshots")
          .upload(menuPath, menuFile, { upsert: true }),
      ]);

      if (physiqueUpload.error) throw physiqueUpload.error;
      if (menuUpload.error) throw menuUpload.error;

      setStatus("coaching");

      const res = await fetch("/api/daily-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logDate,
          weightKg: Number(weightKg),
          physiquePhotoPath: physiqueUpload.data.path,
          menuScreenshotPath: menuUpload.data.path,
        }),
      });

      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Failed to save log");

      setFeedback(body.aiFeedback);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setStatus("idle");
    }
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-6">
      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-white/10 bg-neutral-900 p-6"
      >
        <div className="space-y-1">
          <label className="text-sm text-neutral-400" htmlFor="log-date">
            Date
          </label>
          <input
            id="log-date"
            type="date"
            required
            value={logDate}
            onChange={(e) => setLogDate(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-400" htmlFor="weight">
            Body weight (kg)
          </label>
          <input
            id="weight"
            type="number"
            step="0.1"
            required
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-white outline-none focus:border-emerald-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-400" htmlFor="physique">
            Physique photo
          </label>
          <input
            id="physique"
            type="file"
            accept="image/*"
            required
            onChange={(e) => setPhysiqueFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-white"
          />
        </div>

        <div className="space-y-1">
          <label className="text-sm text-neutral-400" htmlFor="menu">
            Meal plan / menu screenshot
          </label>
          <input
            id="menu"
            type="file"
            accept="image/*"
            required
            onChange={(e) => setMenuFile(e.target.files?.[0] ?? null)}
            className="w-full text-sm text-neutral-300 file:mr-3 file:rounded-lg file:border-0 file:bg-neutral-800 file:px-3 file:py-2 file:text-white"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={status !== "idle"}
          className="w-full rounded-lg bg-emerald-600 px-4 py-2 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {status === "uploading"
            ? "Uploading photos…"
            : status === "coaching"
              ? "Asking your AI coach…"
              : "Log today & get feedback"}
        </button>
      </form>

      {feedback && (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
          <h2 className="mb-2 font-semibold text-emerald-400">
            Your coach says:
          </h2>
          <p className="whitespace-pre-wrap text-sm text-neutral-200">
            {feedback}
          </p>
        </div>
      )}
    </div>
  );
}
