export default function FeedbackCard({
  date,
  feedback,
}: {
  date: string;
  feedback: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-semibold text-emerald-400">Latest AI feedback</h2>
        <span className="text-xs text-neutral-500">{date}</span>
      </div>
      <p className="whitespace-pre-wrap text-sm text-neutral-200">{feedback}</p>
    </div>
  );
}
