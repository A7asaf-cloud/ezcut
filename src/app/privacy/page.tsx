import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | EZCut",
  description: "Privacy Policy for EZCut body cutting-phase tracker.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-300 p-6 flex flex-col items-center">
      <div className="w-full max-w-2xl pt-10 pb-16 space-y-8">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Privacy Policy</h1>
            <p className="text-sm text-neutral-500 mt-1">Last updated: August 2026</p>
          </div>
          <Link
            href="/"
            className="text-sm text-neutral-400 hover:text-neutral-200 border border-white/10 rounded-lg px-4 py-2 hover:bg-neutral-900 transition"
          >
            ← Back
          </Link>
        </div>

        <section className="space-y-6 leading-relaxed">
          <p>
            Welcome to <strong>EZCut</strong>. We value your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application and web dashboard.
          </p>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">1. Information We Collect</h2>
            <p>
              To provide our cutting-phase tracker and coaching feedback services, we collect the following data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Account Information:</strong> Your email address used for sign-up and authentication.
              </li>
              <li>
                <strong>Progress Data:</strong> Daily body weight logs.
              </li>
              <li>
                <strong>Images:</strong> Daily physique photos and meal-plan screenshots uploaded by you.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">2. How We Use Your Information</h2>
            <p>
              Your data is processed and used strictly for the following purposes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>AI Coaching Feedback:</strong> Daily weight values, physique photos, and meal screenshots are sent to the <strong>Google Gemini 2.5 Flash API</strong>. The AI generates feedback, tips, and coaching guidance tailored to your logs. We use the paid tier of Google AI Studio, meaning Google does not use your uploaded images or data to train their models.
              </li>
              <li>
                <strong>Dashboard Visualizations:</strong> Weight entries are used to plot weight trend charts, and physique photos are displayed in your secure personal progress gallery.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">3. Data Storage & Security</h2>
            <p>
              All personal logs and files are stored securely:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                Database rows and user logs are saved in <strong>Supabase</strong> with Row-Level Security (RLS) policies. Each user can only view, insert, or update their own data.
              </li>
              <li>
                Images are uploaded to private Supabase Storage buckets, and are accessible only to the logged-in owner using signed temporary URLs.
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">4. Data Deletion and Account Removal</h2>
            <p>
              We believe in full ownership of your data. You can delete your account at any time from the app&apos;s settings screen. Deleting your account will immediately and permanently:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Delete all your logged entries and weights from the database.</li>
              <li>Delete all physique photos and meal screenshots from our storage buckets.</li>
              <li>Delete your authentication credentials and account record.</li>
            </ul>
            <p>
              This process is irreversible.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-white">5. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by updating the &quot;Last updated&quot; date at the top of this page.
            </p>
          </div>
        </section>

        <div className="border-t border-white/10 pt-6 text-center text-xs text-neutral-500">
          EZCut &copy; 2026. All rights reserved.
        </div>
      </div>
    </main>
  );
}
