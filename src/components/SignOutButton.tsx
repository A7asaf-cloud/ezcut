"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  return (
    <button
      onClick={async () => {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      }}
      className="rounded-lg border border-white/10 px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
    >
      Sign out
    </button>
  );
}
