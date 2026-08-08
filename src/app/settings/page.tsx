import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import SettingsForm from "@/components/SettingsForm";

export const metadata = {
  title: "Settings | EZCut",
  description: "Manage your EZCut account settings and data deletion.",
};

export default async function SettingsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6 flex items-center justify-center">
      <SettingsForm userEmail={user.email ?? ""} />
    </main>
  );
}
