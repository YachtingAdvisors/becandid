export default function PrivacyBadge({ sharedWith }: { sharedWith?: string }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/5 ring-1 ring-emerald-500/15">
      <span className="material-symbols-outlined text-emerald-500 text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
      <span className="text-[9px] font-label font-semibold text-emerald-600">
        {sharedWith ? `Only shared with ${sharedWith}` : 'Private to you'}
      </span>
    </div>
  );
}
