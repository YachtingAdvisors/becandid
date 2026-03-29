import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import { GOAL_LABELS, getCategoryEmoji, type GoalCategory, type Severity } from '@be-candid/shared';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import RegenerateGuide from '@/components/dashboard/RegenerateGuide';

interface Props {
  params: { alertId: string };
}

export default async function ConversationPage({ params }: Props) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();

  const { data: alert } = await db
    .from('alerts')
    .select('*, events(id, category, severity, platform, timestamp)')
    .eq('id', params.alertId)
    .single();

  if (!alert) return notFound();

  // Verify access
  const isOwner = alert.user_id === user.id;
  if (!isOwner) {
    const { data: partnerRecord } = await db
      .from('partners')
      .select('id')
      .eq('user_id', alert.user_id)
      .eq('partner_user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();
    if (!partnerRecord) return notFound();
  }

  const event = (alert as any).events;
  const role = isOwner ? 'user' : 'partner';
  const guideRaw = role === 'user' ? alert.ai_guide_user : alert.ai_guide_partner;
  const guide = guideRaw ? JSON.parse(guideRaw) : null;
  const categoryLabel = GOAL_LABELS[event?.category as GoalCategory] ?? event?.category;

  return (
    <div className="min-h-screen bg-surface">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href={isOwner ? '/dashboard/conversations' : '/partner/conversations'}
            className="text-sm text-primary hover:underline font-label">← Back</Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-3xl">{getCategoryEmoji(event?.category as GoalCategory)}</span>
          <div>
            <h1 className="font-headline text-2xl font-bold text-on-surface">{categoryLabel} — Conversation Guide</h1>
            <p className="text-sm text-on-surface-variant font-body">
              {event?.severity} severity · {event?.platform} · {new Date(event?.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        {!isOwner && (
          <div className="px-3 py-2 rounded-xl bg-primary-container/30 border border-outline-variant text-xs text-on-primary-container font-medium">
            👁 Partner view — showing the guide prepared for you
          </div>
        )}

        {guide ? (
          <>
          <div className="space-y-4">
            {role === 'user' ? (
              <>
                <GuideSection title="How to Open the Conversation" icon="💬" color="primary">
                  {guide.opening}
                </GuideSection>
                <GuideSection title="How to Be Honest" icon="🤝" color="violet">
                  {guide.how_to_be_honest}
                </GuideSection>
                <GuideSection title="What to Ask For" icon="🙏" color="emerald">
                  {guide.what_to_ask_for}
                </GuideSection>
                <div className="card p-5 bg-amber-50 border-amber-200 text-center">
                  <p className="text-sm italic text-amber-800 leading-relaxed font-body">"{guide.affirmation}"</p>
                </div>
                {guide.professional_resources && (
                  <GuideSection title="Additional Support" icon="💙" color="blue">
                    {guide.professional_resources}
                  </GuideSection>
                )}
              </>
            ) : (
              <>
                <GuideSection title="How to Open" icon="💬" color="primary">
                  {guide.opening}
                </GuideSection>
                <GuideSection title="What NOT to Say or Do" icon="🚫" color="red">
                  {Array.isArray(guide.what_not_to_say)
                    ? guide.what_not_to_say.map((w: string, i: number) => <p key={i} className="mb-1">• {w}</p>)
                    : guide.what_not_to_say}
                </GuideSection>
                <GuideSection title="Questions to Ask" icon="❓" color="emerald">
                  {Array.isArray(guide.questions)
                    ? guide.questions.map((q: string, i: number) => <p key={i} className="mb-1">• {q}</p>)
                    : guide.questions}
                </GuideSection>
                <GuideSection title="Creating Safety" icon="🛡️" color="violet">
                  {guide.how_to_create_safety}
                </GuideSection>
              </>
            )}
          </div>

          {/* Regenerate button */}
          <div className="pt-2">
            <RegenerateGuide alertId={params.alertId} />
            <p className="text-xs text-on-surface-variant mt-2 font-body">
              Not quite right? Generate a fresh guide with updated context.
            </p>
          </div>
          </>
        ) : (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="font-headline text-lg font-bold text-on-surface mb-2">No guide available</h3>
            <p className="text-sm text-on-surface-variant font-body">The AI guide wasn't generated for this alert. Use your own judgment and the principles of honest, non-judgmental conversation.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GuideSection({ title, icon, color, children }: { title: string; icon: string; color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    primary: 'border-primary/30 bg-primary-container/20',
    violet: 'border-violet-300 bg-violet-50/50',
    emerald: 'border-emerald-300 bg-emerald-50/50',
    red: 'border-red-300 bg-red-50/50',
    blue: 'border-blue-300 bg-blue-50/50',
  };

  return (
    <div className={`card p-5 border-l-4 ${colors[color] ?? colors.primary}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <h3 className="text-xs font-semibold text-on-surface uppercase tracking-wider font-label">{title}</h3>
      </div>
      <div className="text-sm text-on-surface leading-relaxed font-body">{children}</div>
    </div>
  );
}
