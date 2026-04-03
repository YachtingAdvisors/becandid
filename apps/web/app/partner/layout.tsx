import { createServerSupabaseClient, createServiceClient } from '@/lib/supabase';
import PartnerNav from '@/components/dashboard/PartnerNav';
import PartnerRealtimeProvider from '@/components/dashboard/PartnerRealtimeProvider';

export default async function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const db = createServiceClient();

  const { data: partnership } = await db
    .from('partners')
    .select('user_id')
    .eq('partner_user_id', user.id)
    .eq('status', 'active')
    .maybeSingle();

  let monitoredName = 'Partner';
  if (partnership) {
    const { data: monitored } = await db
      .from('users')
      .select('name')
      .eq('id', partnership.user_id)
      .single();
    monitoredName = monitored?.name ?? 'Partner';
  }

  return (
    <div className="min-h-screen bg-surface">
      <PartnerNav monitoredName={monitoredName} />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {children}
      </main>
      <PartnerRealtimeProvider />
    </div>
  );
}
