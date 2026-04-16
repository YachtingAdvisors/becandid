import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';
import { requireAdminAccess } from '@/lib/adminAccess';
import AdminNav from './AdminNav';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s | Admin — Be Candid' },
  description: 'Be Candid administration panel.',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const adminAccess = await requireAdminAccess(supabase, user);

  if (!adminAccess.ok) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="bg-surface-container-lowest rounded-3xl border border-outline-variant p-10 text-center max-w-md">
          <span className="material-symbols-outlined text-5xl text-error mb-4 block">
            shield
          </span>
          <h1 className="font-headline text-2xl font-extrabold text-on-surface mb-2">
            Access Denied
          </h1>
          <p className="text-sm text-on-surface-variant font-body">
            {adminAccess.status === 503
              ? 'We could not verify your admin access right now. Please try again shortly.'
              : 'You do not have permission to view this page. If you believe this is an error, contact the platform administrator.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
          Admin Panel
        </h1>
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-label font-semibold bg-primary/10 text-primary">
          <span className="material-symbols-outlined text-sm">
            admin_panel_settings
          </span>
          Admin
        </span>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
