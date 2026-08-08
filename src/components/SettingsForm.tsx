"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SettingsFormProps {
  userEmail: string;
}

export default function SettingsForm({ userEmail }: SettingsFormProps) {
  const router = useRouter();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDeleteAccount() {
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm deletion.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/account/delete", {
        method: "POST",
      });

      const body = await res.json();
      if (!res.ok) {
        throw new Error(body.error ?? "Failed to delete account");
      }

      // Successful deletion. The server has signed out the user.
      router.push("/login");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md space-y-6">
      {/* Settings Card */}
      <div className="rounded-2xl border border-white/10 bg-neutral-900 p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-4">
          <h1 className="text-xl font-semibold text-white">Settings</h1>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-400 hover:text-neutral-200"
          >
            ← Dashboard
          </Link>
        </div>

        {/* User Info */}
        <div className="space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Account Email
          </span>
          <p className="text-neutral-200 font-medium">{userEmail}</p>
        </div>

        {/* Info & Policy Links */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
            Resources
          </span>
          <div>
            <Link
              href="/privacy"
              className="inline-flex items-center text-sm text-emerald-400 hover:underline hover:text-emerald-300"
            >
              Privacy Policy & Data Rights
            </Link>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="border-t border-red-500/20 pt-6 space-y-4">
          <h2 className="text-sm font-semibold text-red-500 uppercase tracking-wider">
            Danger Zone
          </h2>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Deleting your account will permanently delete all logs, physique
            photos, meal screenshots, and auth credentials. This action is
            irreversible.
          </p>
          <button
            onClick={() => {
              setConfirmText("");
              setError(null);
              setShowConfirmModal(true);
            }}
            className="w-full rounded-lg border border-red-500/30 bg-red-950/20 px-4 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-950/40 hover:border-red-500/50"
          >
            Delete Account
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-neutral-900 p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-semibold text-white">Delete Account?</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              All your daily weight entries, progress photo history, and coaching logs will be wiped from our storage servers permanently.
            </p>
            <div className="space-y-2">
              <label
                htmlFor="confirm-input"
                className="text-xs text-neutral-400 block"
              >
                Type <span className="font-mono text-red-400 font-semibold">DELETE</span> to confirm:
              </label>
              <input
                id="confirm-input"
                type="text"
                autoComplete="off"
                placeholder="DELETE"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-neutral-800 px-3 py-2 text-white text-sm outline-none focus:border-red-500"
              />
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                disabled={loading}
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-lg border border-white/10 bg-neutral-800 px-4 py-2 text-sm text-neutral-300 transition hover:bg-neutral-700 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                disabled={loading || confirmText !== "DELETE"}
                onClick={handleDeleteAccount}
                className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:opacity-50"
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
