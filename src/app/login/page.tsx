import AuthForm from "@/components/AuthForm";

// Renders a client component that talks to Supabase using the browser
// client — skip static prerendering so it doesn't need env vars at build time.
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-950 p-6">
      <AuthForm />
    </main>
  );
}
