import type { Metadata } from 'next';
import { createServerSupabaseClient } from '@/lib/supabase';
import { isAdmin } from '@/lib/isAdmin';
import AdminDashboardClient from './AdminDashboardClient';

export const metadata: Metadata = {
  title: 'Admin Dashboard',
  description: 'Platform-wide metrics and health overview for Be Candid administrators.',
};

export default async function AdminPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !isAdmin(user.email || '')) {
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
            You do not have permission to view this page. If you believe this is an error,
            contact the platform administrator.
          </p>
        </div>
      </div>
    );
  }

  return <AdminDashboardClient />;
}
